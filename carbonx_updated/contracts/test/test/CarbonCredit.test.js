const { expect }  = require("chai");
const { ethers }  = require("hardhat");

describe("CarbonCredit", function () {
  let contract, owner, validator, relayer, ngo, buyer, auditor;

  beforeEach(async () => {
    [owner, validator, relayer, ngo, buyer, auditor] = await ethers.getSigners();

    const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
    contract = await CarbonCredit.deploy(relayer.address);
    await contract.waitForDeployment();

    // Grant validator role
    const VALIDATOR_ROLE = await contract.VALIDATOR_ROLE();
    await contract.connect(owner).grantRole(VALIDATOR_ROLE, validator.address);
  });

  // ─── proposeProject ────────────────────────────────────────────
  describe("proposeProject", () => {
    it("allows anyone to propose a project", async () => {
      const tx = await contract.connect(ngo).proposeProject("ipfs://QmTest123", 10_000);
      const receipt = await tx.wait();

      const event = receipt.logs.find(l => {
        try { return contract.interface.parseLog(l).name === "ProjectProposed"; } catch { return false; }
      });
      expect(event).to.not.be.undefined;

      const project = await contract.getProject(1);
      expect(project.proposer).to.equal(ngo.address);
      expect(project.targetCredits).to.equal(10_000n);
      expect(project.status).to.equal(0); // Proposed
    });

    it("reverts on empty metadataURI", async () => {
      await expect(
        contract.connect(ngo).proposeProject("", 5_000)
      ).to.be.revertedWith("CarbonCredit: empty metadata URI");
    });

    it("reverts on zero targetCredits", async () => {
      await expect(
        contract.connect(ngo).proposeProject("ipfs://QmTest", 0)
      ).to.be.revertedWith("CarbonCredit: zero target credits");
    });
  });

  // ─── verifyProject ─────────────────────────────────────────────
  describe("verifyProject", () => {
    beforeEach(async () => {
      await contract.connect(ngo).proposeProject("ipfs://QmTest", 10_000);
    });

    it("validator can verify a proposed project", async () => {
      await expect(contract.connect(validator).verifyProject(1, 84))
        .to.emit(contract, "ProjectVerified")
        .withArgs(1, validator.address, 84);

      const project = await contract.getProject(1);
      expect(project.status).to.equal(2); // Verified
      expect(project.ndviScore).to.equal(84);
    });

    it("non-validator cannot verify", async () => {
      await expect(
        contract.connect(ngo).verifyProject(1, 80)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("cannot verify non-existent project", async () => {
      await expect(
        contract.connect(validator).verifyProject(999, 80)
      ).to.be.revertedWith("CarbonCredit: project not found");
    });
  });

  // ─── mintCarbonCredits ─────────────────────────────────────────
  describe("mintCarbonCredits", () => {
    beforeEach(async () => {
      await contract.connect(ngo).proposeProject("ipfs://QmMint", 10_000);
      await contract.connect(validator).verifyProject(1, 84);
    });

    it("relayer can mint credits to buyer", async () => {
      await expect(contract.connect(relayer).mintCarbonCredits(1, buyer.address, 500))
        .to.emit(contract, "CreditsMinted")
        .withArgs(1, buyer.address, 500, relayer.address);

      expect(await contract.balanceOf(buyer.address, 1)).to.equal(500n);

      const project = await contract.getProject(1);
      expect(project.issuedCredits).to.equal(500n);
    });

    it("cannot mint beyond targetCredits", async () => {
      await expect(
        contract.connect(relayer).mintCarbonCredits(1, buyer.address, 10_001)
      ).to.be.revertedWith("CarbonCredit: would exceed target credit supply");
    });

    it("non-relayer cannot mint", async () => {
      await expect(
        contract.connect(ngo).mintCarbonCredits(1, buyer.address, 100)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("cannot mint to zero address", async () => {
      await expect(
        contract.connect(relayer).mintCarbonCredits(1, ethers.ZeroAddress, 100)
      ).to.be.revertedWith("CarbonCredit: zero recipient");
    });
  });

  // ─── retireCredits ─────────────────────────────────────────────
  describe("retireCredits", () => {
    beforeEach(async () => {
      await contract.connect(ngo).proposeProject("ipfs://QmRetire", 10_000);
      await contract.connect(validator).verifyProject(1, 84);
      await contract.connect(relayer).mintCarbonCredits(1, buyer.address, 1_000);
    });

    it("buyer can retire their credits", async () => {
      await expect(
        contract.connect(buyer).retireCredits(1, 250, "Q1 2025 Scope 3 offset")
      )
        .to.emit(contract, "CreditsRetired")
        .withArgs(1, 1, buyer.address, 250, "Q1 2025 Scope 3 offset");

      // Balance reduced
      expect(await contract.balanceOf(buyer.address, 1)).to.equal(750n);

      // Project retired counter updated
      const project = await contract.getProject(1);
      expect(project.retiredCredits).to.equal(250n);

      // Retirement record stored
      const record = await contract.getRetirement(1);
      expect(record.amount).to.equal(250n);
      expect(record.retiree).to.equal(buyer.address);
      expect(record.note).to.equal("Q1 2025 Scope 3 offset");
    });

    it("reverts when retiring more than balance", async () => {
      await expect(
        contract.connect(buyer).retireCredits(1, 9_999, "over-retire")
      ).to.be.revertedWith("CarbonCredit: insufficient balance");
    });

    it("reverts on empty retirement note", async () => {
      await expect(
        contract.connect(buyer).retireCredits(1, 100, "")
      ).to.be.revertedWith("CarbonCredit: note required");
    });
  });

  // ─── availableCredits ──────────────────────────────────────────
  describe("availableCredits", () => {
    it("returns remaining mintable credits", async () => {
      await contract.connect(ngo).proposeProject("ipfs://QmAvail", 5_000);
      await contract.connect(validator).verifyProject(1, 75);
      await contract.connect(relayer).mintCarbonCredits(1, buyer.address, 2_000);

      expect(await contract.availableCredits(1)).to.equal(3_000n);
    });
  });

  // ─── pause / unpause ───────────────────────────────────────────
  describe("pausable", () => {
    it("owner can pause and unpause", async () => {
      await contract.connect(owner).pause();
      await expect(
        contract.connect(ngo).proposeProject("ipfs://QmPause", 1_000)
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");

      await contract.connect(owner).unpause();
      await expect(
        contract.connect(ngo).proposeProject("ipfs://QmPause", 1_000)
      ).to.not.be.reverted;
    });
  });
});

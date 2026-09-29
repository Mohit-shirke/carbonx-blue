// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title  CarbonCredit
 * @notice ERC-1155 Blue Carbon Registry on Polygon Mainnet (Chain ID: 137)
 * @dev    Each project maps to a unique ERC-1155 token ID.
 *         Flow: proposeProject → verifyProject → mintCarbonCredits → retireCredits
 *
 *  Roles:
 *   - owner        : contract deployer, can grant/revoke roles
 *   - VALIDATOR     : Government Validator – can call verifyProject
 *   - RELAYER       : Server relayer wallet – can call mintCarbonCredits
 */

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract CarbonCredit is
    ERC1155,
    ERC1155Burnable,
    ERC1155Supply,
    AccessControl,
    ReentrancyGuard,
    Pausable
{
    // ─── Roles ────────────────────────────────────────────────────
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant RELAYER_ROLE   = keccak256("RELAYER_ROLE");
    bytes32 public constant AUDITOR_ROLE   = keccak256("AUDITOR_ROLE");

    // ─── State: Projects ──────────────────────────────────────────
    enum ProjectStatus { Proposed, PendingMRV, Verified, Rejected, Active }

    struct Project {
        uint256 id;
        address proposer;
        string  metadataURI;        // IPFS hash pointing to project JSON
        uint256 targetCredits;      // Total tCO2e sequestration goal
        uint256 issuedCredits;      // Minted so far
        uint256 retiredCredits;     // Permanently burned
        ProjectStatus status;
        uint256 createdAt;
        uint256 verifiedAt;
        uint8   ndviScore;          // NDVI × 100 (e.g. 84 = 0.84)
    }

    // ─── State: Retirements ───────────────────────────────────────
    struct RetirementRecord {
        uint256 tokenId;
        uint256 amount;
        address retiree;
        string  note;
        uint256 timestamp;
    }

    // ─── Storage ──────────────────────────────────────────────────
    uint256 private _projectCounter;
    uint256 private _retirementCounter;

    mapping(uint256 => Project)          public projects;
    mapping(uint256 => RetirementRecord) public retirements;
    mapping(uint256 => string)           private _tokenURIs;  // tokenId → IPFS metadata
    mapping(address => uint256[])        public proposerProjects;
    mapping(address => uint256)          public totalRetiredByWallet;

    // ─── Events ───────────────────────────────────────────────────
    event ProjectProposed(
        uint256 indexed projectId,
        address indexed proposer,
        string metadataURI,
        uint256 targetCredits
    );
    event ProjectVerified(
        uint256 indexed projectId,
        address indexed validator,
        uint8   ndviScore
    );
    event ProjectRejected(
        uint256 indexed projectId,
        address indexed validator,
        string  reason
    );
    event CreditsMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount,
        address indexed relayer
    );
    event CreditsRetired(
        uint256 indexed retirementId,
        uint256 indexed tokenId,
        address indexed retiree,
        uint256 amount,
        string  note
    );
    event MetadataUpdated(uint256 indexed projectId, string newURI);

    // ─── Constructor ──────────────────────────────────────────────
    constructor(address initialRelayer)
        ERC1155("https://carbonx.app/api/metadata/{id}.json")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE,     msg.sender);
        _grantRole(RELAYER_ROLE,       msg.sender);
        if (initialRelayer != address(0) && initialRelayer != msg.sender) {
            _grantRole(RELAYER_ROLE, initialRelayer);
        }
    }

    // ─── PROJECT LIFECYCLE ────────────────────────────────────────

    /**
     * @notice NGO proposes a new carbon sequestration project
     * @param  metadataURI   IPFS URI containing project details, GPS coords, images
     * @param  targetCredits Total tCO2e the project aims to sequester
     * @return projectId     Newly assigned project ID (= ERC-1155 token ID)
     */
    function proposeProject(
        string  calldata metadataURI,
        uint256 targetCredits
    )
        external
        whenNotPaused
        returns (uint256 projectId)
    {
        require(bytes(metadataURI).length > 0,  "CarbonCredit: empty metadata URI");
        require(targetCredits > 0,              "CarbonCredit: zero target credits");

        projectId = ++_projectCounter;

        projects[projectId] = Project({
            id:             projectId,
            proposer:       msg.sender,
            metadataURI:    metadataURI,
            targetCredits:  targetCredits,
            issuedCredits:  0,
            retiredCredits: 0,
            status:         ProjectStatus.Proposed,
            createdAt:      block.timestamp,
            verifiedAt:     0,
            ndviScore:      0
        });

        _tokenURIs[projectId] = metadataURI;
        proposerProjects[msg.sender].push(projectId);

        emit ProjectProposed(projectId, msg.sender, metadataURI, targetCredits);
    }

    /**
     * @notice Government Validator verifies a project after MRV analysis
     * @param  projectId  Project to verify
     * @param  ndviScore  NDVI × 100 (e.g. pass 84 for NDVI = 0.84)
     */
    function verifyProject(uint256 projectId, uint8 ndviScore)
        external
        onlyRole(VALIDATOR_ROLE)
        whenNotPaused
    {
        Project storage p = projects[projectId];
        require(p.id != 0,                              "CarbonCredit: project not found");
        require(
            p.status == ProjectStatus.Proposed ||
            p.status == ProjectStatus.PendingMRV,
            "CarbonCredit: project not in verifiable state"
        );
        require(ndviScore <= 100, "CarbonCredit: NDVI score must be 0-100");

        p.status     = ProjectStatus.Verified;
        p.verifiedAt = block.timestamp;
        p.ndviScore  = ndviScore;

        emit ProjectVerified(projectId, msg.sender, ndviScore);
    }

    /**
     * @notice Reject a project (Validator only)
     */
    function rejectProject(uint256 projectId, string calldata reason)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        Project storage p = projects[projectId];
        require(p.id != 0, "CarbonCredit: project not found");
        require(p.status != ProjectStatus.Rejected, "CarbonCredit: already rejected");

        p.status = ProjectStatus.Rejected;
        emit ProjectRejected(projectId, msg.sender, reason);
    }

    // ─── CREDIT OPERATIONS ────────────────────────────────────────

    /**
     * @notice Mint carbon credits (ERC-1155 tokens) for a verified project
     * @dev    Only callable by RELAYER_ROLE (server-side wallet post-payment)
     * @param  projectId  The verified project ID (= token ID)
     * @param  recipient  Buyer's wallet address
     * @param  amount     Number of tCO2e tokens to mint
     */
    function mintCarbonCredits(
        uint256 projectId,
        address recipient,
        uint256 amount
    )
        external
        onlyRole(RELAYER_ROLE)
        nonReentrant
        whenNotPaused
    {
        Project storage p = projects[projectId];
        require(p.id != 0,                          "CarbonCredit: project not found");
        require(
            p.status == ProjectStatus.Verified ||
            p.status == ProjectStatus.Active,
            "CarbonCredit: project must be verified"
        );
        require(recipient != address(0),            "CarbonCredit: zero recipient");
        require(amount > 0,                         "CarbonCredit: zero amount");
        require(
            p.issuedCredits + amount <= p.targetCredits,
            "CarbonCredit: would exceed target credit supply"
        );

        p.issuedCredits += amount;
        if (p.status == ProjectStatus.Verified) {
            p.status = ProjectStatus.Active;
        }

        _mint(recipient, projectId, amount, "");

        emit CreditsMinted(projectId, recipient, amount, msg.sender);
    }

    /**
     * @notice Retire (permanently burn) carbon credits to complete an offset
     * @dev    Transfers tokens to address(0) — irreversible.
     * @param  tokenId         ERC-1155 token ID (= project ID)
     * @param  amount          tCO2e amount to retire
     * @param  retirementNote  Human-readable offset purpose (e.g. "Q2 2025 Scope 3")
     * @return retirementId    Unique retirement record ID
     */
    function retireCredits(
        uint256 tokenId,
        uint256 amount,
        string calldata retirementNote
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 retirementId)
    {
        require(amount > 0,                                 "CarbonCredit: zero amount");
        require(balanceOf(msg.sender, tokenId) >= amount,   "CarbonCredit: insufficient balance");
        require(bytes(retirementNote).length > 0,           "CarbonCredit: note required");

        // Burn the tokens (send to dead address implicitly via _burn)
        _burn(msg.sender, tokenId, amount);

        // Update project retired counter
        Project storage p = projects[tokenId];
        if (p.id != 0) {
            p.retiredCredits += amount;
        }

        // Record retirement
        retirementId = ++_retirementCounter;
        retirements[retirementId] = RetirementRecord({
            tokenId:   tokenId,
            amount:    amount,
            retiree:   msg.sender,
            note:      retirementNote,
            timestamp: block.timestamp
        });

        totalRetiredByWallet[msg.sender] += amount;

        emit CreditsRetired(retirementId, tokenId, msg.sender, amount, retirementNote);
    }

    // ─── BATCH OPERATIONS ─────────────────────────────────────────

    /**
     * @notice Batch mint across multiple projects in a single transaction (Relayer only)
     */
    function batchMintCredits(
        uint256[] calldata projectIds,
        address[] calldata recipients,
        uint256[] calldata amounts
    )
        external
        onlyRole(RELAYER_ROLE)
        nonReentrant
        whenNotPaused
    {
        require(
            projectIds.length == recipients.length &&
            recipients.length == amounts.length,
            "CarbonCredit: array length mismatch"
        );
        for (uint256 i = 0; i < projectIds.length; i++) {
            // Inline mint logic (avoid external call overhead)
            Project storage p = projects[projectIds[i]];
            require(
                p.status == ProjectStatus.Verified || p.status == ProjectStatus.Active,
                "CarbonCredit: project not verified"
            );
            require(p.issuedCredits + amounts[i] <= p.targetCredits, "CarbonCredit: supply exceeded");
            p.issuedCredits += amounts[i];
            _mint(recipients[i], projectIds[i], amounts[i], "");
            emit CreditsMinted(projectIds[i], recipients[i], amounts[i], msg.sender);
        }
    }

    // ─── VIEW FUNCTIONS ───────────────────────────────────────────

    /**
     * @notice Get full project details
     */
    function getProject(uint256 projectId)
        external view
        returns (Project memory)
    {
        require(projects[projectId].id != 0, "CarbonCredit: project not found");
        return projects[projectId];
    }

    /**
     * @notice Get retirement record
     */
    function getRetirement(uint256 retirementId)
        external view
        returns (RetirementRecord memory)
    {
        return retirements[retirementId];
    }

    /**
     * @notice Get all project IDs proposed by a wallet
     */
    function getProposerProjects(address proposer)
        external view
        returns (uint256[] memory)
    {
        return proposerProjects[proposer];
    }

    /**
     * @notice Total number of projects proposed
     */
    function totalProjects() external view returns (uint256) {
        return _projectCounter;
    }

    /**
     * @notice Total retirement records
     */
    function totalRetirements() external view returns (uint256) {
        return _retirementCounter;
    }

    /**
     * @notice Remaining mintable credits for a project
     */
    function availableCredits(uint256 projectId) external view returns (uint256) {
        Project storage p = projects[projectId];
        if (p.targetCredits <= p.issuedCredits) return 0;
        return p.targetCredits - p.issuedCredits;
    }

    // ─── METADATA ─────────────────────────────────────────────────

    /**
     * @notice Returns per-token IPFS metadata URI
     */
    function uri(uint256 tokenId)
        public view
        override
        returns (string memory)
    {
        string memory tokenSpecific = _tokenURIs[tokenId];
        if (bytes(tokenSpecific).length > 0) return tokenSpecific;
        return super.uri(tokenId);
    }

    /**
     * @notice Validator can update project metadata URI (e.g. after MRV report)
     */
    function updateMetadataURI(uint256 projectId, string calldata newURI)
        external
        onlyRole(VALIDATOR_ROLE)
    {
        require(projects[projectId].id != 0, "CarbonCredit: project not found");
        projects[projectId].metadataURI = newURI;
        _tokenURIs[projectId] = newURI;
        emit MetadataUpdated(projectId, newURI);
    }

    // ─── ADMIN ────────────────────────────────────────────────────

    function pause()   external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    // ─── OVERRIDES ────────────────────────────────────────────────

    /**
     * @dev Required override: ERC1155 + ERC1155Supply both define _update
     */
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    )
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }

    /**
     * @dev Required override: ERC1155 + AccessControl both implement supportsInterface
     */
    function supportsInterface(bytes4 interfaceId)
        public view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

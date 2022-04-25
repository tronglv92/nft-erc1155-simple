pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourCollectible is ERC1155, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  mapping(uint256 => string) private _uris;

  mapping(uint256 => uint256) public tokenSupply;

  constructor() ERC1155("") {}

  function mint(
    address _to,
    uint256 _id,
    uint256 _quantity,
    bytes memory _data
  ) public onlyOwner {
    if (tokenSupply[_id] == 0) {
      _tokenIds.increment();
      uint256 tokenIds = _tokenIds.current();

      require(_id == tokenIds, "Wrong id provided");
    }
    _mint(_to, _id, _quantity, _data);
    tokenSupply[_id] += _quantity;
  }

  function uri(uint256 tokenIds_) public view virtual override returns (string memory) {
    return _uris[tokenIds_];
  }

  function setTokenUri(uint256 tokenId, string memory uri_) public onlyOwner {
    require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
    _uris[tokenId] = uri_;
  }

  function _getNextTokenID() private view returns (uint256) {
    return _tokenIds.current() + 1;
  }

  function _getCurrentTokenID() private view returns (uint256) {
    return _tokenIds.current();
  }
}

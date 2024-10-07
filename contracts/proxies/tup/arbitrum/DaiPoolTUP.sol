// SPDX-License-Identifier: BUSL-1.1
// Last deployed from commit: dd55c504f56a3b35ef5ee926b79820670a9f8344;
pragma solidity 0.8.17;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract DaiPoolTUP is TransparentUpgradeableProxy {
    constructor(address _logic, address admin_, bytes memory _data) TransparentUpgradeableProxy(_logic, admin_, _data) {}
}

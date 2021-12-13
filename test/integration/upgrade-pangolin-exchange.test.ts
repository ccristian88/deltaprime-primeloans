import {Asset, deployAndInitPangolinExchangeContract, syncTime, toBytes32} from "../_helpers";
import {
    MockUpgradedPangolinExchange__factory,
    PangolinExchange, PangolinExchange__factory, Pool__factory, TransparentUpgradeableProxy,
    TransparentUpgradeableProxy__factory,
    UpgradeableBeacon
} from "../../typechain";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import chai, {expect} from "chai";
import {solidity} from "ethereum-waffle";
import {ethers, waffle} from "hardhat";
import {getFixedGasSigners} from "../_helpers";

chai.use(solidity);

const {deployContract, provider} = waffle;

const ZERO = ethers.constants.AddressZero;
const pangolinRouterAddress = '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106';
const usdTokenAddress = '0xc7198437980c041c805a1edcba50c1ce5db95118';

describe('Smart loan - upgrading',  () => {
    before("Synchronize blockchain time", async () => {
        await syncTime();
    });

    describe('Check basic logic before and after upgrade', () => {
        let exchange: PangolinExchange,
            owner: SignerWithAddress,
            admin: SignerWithAddress,
            proxy: TransparentUpgradeableProxy;
        before("should deploy provider, exchange, loansFactory and pool", async () => {
            [, owner, admin] = await getFixedGasSigners(10000000);
            exchange = await deployAndInitPangolinExchangeContract(owner, pangolinRouterAddress, [new Asset(toBytes32('USD'), usdTokenAddress)]);

            proxy = await (new TransparentUpgradeableProxy__factory(owner).deploy(exchange.address, admin.address, []));
            exchange = await (new PangolinExchange__factory(owner).attach(proxy.address));

            await exchange.connect(owner).initialize(pangolinRouterAddress, [new Asset(toBytes32('USD'), usdTokenAddress)]);
        });

        it("should not allow to upgrade from non-owner", async () => {
            const exchangeV2 = await (new MockUpgradedPangolinExchange__factory(owner).deploy());
            await expect(proxy.connect(owner).upgradeTo(exchangeV2.address))
                .to.be.revertedWith("Transaction reverted: function selector was not recognized and there's no fallback function");
        });


        it("should upgrade", async () => {
            const exchangeV2 = await (new MockUpgradedPangolinExchange__factory(owner).deploy());

            await proxy.connect(admin).upgradeTo(exchangeV2.address);

            //The mock exchange has a hardcoded return value of 1337
            expect(await exchange.connect(owner).getEstimatedAVAXForERC20Token(0, ZERO)).to.be.equal(1337);
        });
    });
});
const { constants, networkConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/deployment/verify")
const { initialize } = require("../utils/deployment/initialize")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    const isDevelopmentChain = constants.developmentChains.includes(network.name)

    const contractConfig = networkConfig[chainId].contracts.Timelock

    let args = [
        contractConfig.args.minDelay,
        contractConfig.args.proposers,
        contractConfig.args.executors,
    ]

    log(`Deploying ${contractConfig.name} to ${network.name}`)
    const deployedContract = await deploy(contractConfig.name, {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`${contractConfig.name} (${deployedContract.address}) deployed at (${network.name})`)

    initialize(contractConfig.name, deployedContract.address, args)

    if (!isDevelopmentChain && process.env.ETHERSCAN_API_KEY) {
        await verify(deployedContract.address, constructorArguments)
    }

    log("------------------------------")
}

module.exports.tags = ["all", "Timelock", "actualDeployments"]
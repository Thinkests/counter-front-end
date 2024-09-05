import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from "@ton/core";

export type MainContractConfig = {
    number: number;
    address: Address;
    owner_address: Address;
};

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
        .storeUint(config.number, 32)
        .storeAddress(config.address)
        .storeAddress(config.owner_address)
        .endCell();
}

export class MainContract implements Contract {

    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell; }
    ) { }

    static createFromConfig(
        config: MainContractConfig,
        code: Cell,
        workchain = 0
    ): MainContract {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);

        return new MainContract(address, init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint): Promise<void> {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendIncrement(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        increment_by: number
    ): Promise<void> {
        const msg_body = beginCell()
            .storeUint(1, 32) // OP code
            .storeUint(increment_by, 32) // increment_by value
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendDeposit(provider: ContractProvider, sender: Sender, value: bigint): Promise<void> {
        const msg_body = beginCell()
            .storeUint(2, 32) // OP code
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendNoCodeDeposit(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ): Promise<void> {
        const msg_body = beginCell().endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async sendWithdrawalRequest(
        provider: ContractProvider,
        sender: Sender,
        value: bigint,
        amount: bigint
    ): Promise<void> {
        const msg_body = beginCell()
            .storeUint(3, 32) // OP code
            .storeCoins(amount)
            .endCell();

        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: msg_body,
        });
    }

    async getData(provider: ContractProvider): Promise<{
        number: number;
        recent_sender: Address;
        owner_address: Address;
    }> {
        const { stack } = await provider.get("get_contract_storage_data", []);

        return {
            number: stack.readNumber(),
            recent_sender: stack.readAddress(),
            owner_address: stack.readAddress(),
        };
    }

    async getBalance(provider: ContractProvider): Promise<{
        number: number;
    }> {
        const { stack } = await provider.get("balance", []);
        return {
            number: stack.readNumber(),
        };
    }
}

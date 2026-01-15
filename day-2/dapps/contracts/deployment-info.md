# Deployment Information

## Contract Details

**Contract Address:** `0xcf08e68e3fc40c06b0f7073dc684171b7c928bf7`

**Network:** Avalanche Fuji Testnet

**Explorer:** https://testnet.snowtrace.io/address/0xcf08e68e3fc40c06b0f7073dc684171b7c928bf7

## Transactions

1. Contract Creation (Deploy) - Event: OwnerSet
2. setValue(70) - Event: ValueUpdated(70)
3. setValue(80) - Event: ValueUpdated(80)

## ABI Location

ABI file location: `artifacts/contracts/simple-storage.sol/SimpleStorage.json`

## Notes

- Contract has owner access control
- Only owner can call setValue() and setMessage()
- Events are properly emitted for tracking changes

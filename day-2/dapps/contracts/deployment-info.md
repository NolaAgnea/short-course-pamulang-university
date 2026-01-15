# Deployment Information

## Contract Details

**Contract Address:** `0x8b427e7f1291dc686bd32315afafe44be50fefce`

**Network:** Avalanche Fuji Testnet

**Explorer:** https://testnet.snowtrace.io/address/0x8b427E7F1291DC686bD32315AFafE44be50FefcE

## Transactions

1. Contract Creation (Deploy) - Event: OwnerSet
2. setValue(999) - Event: ValueUpdated(999)
3. setValue(30) - Event: ValueUpdated(30)
4. setMessage() - Event: Halo ini Nola

## ABI Location

ABI file location: `artifacts/contracts/simple-storage.sol/SimpleStorage.json`

## Notes

- Contract has owner access control
- Only owner can call setValue() and setMessage()
- Events are properly emitted for tracking changes

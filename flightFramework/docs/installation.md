## Getting flightframework

### Option #1: Roblox Marketplace
- You can download flightFramework [here]()

### Option #2: Github
- [Github repository](https://github.com/funnyfinch/flightframework)

### Option #3: Wally
```toml
[dependencies]
flightFramework = "funnyfinch/flightframework@0.1.5"
```
## Make sure everything is working
Let's try some basic reactive state

```luau
local replicatedStorage = game:GetService("ReplicatedStorage")
local flight = require(replicatedStorage.packages.flightFramework)

local myState = flight.state.value(0)

myState.changed:connect(function(new, old)
    print(`state changed: {old} → {new}`)
end)

while task.wait(1) do
    myState:update(function(number)
        return number + 1 -- increment number by 1 every second
    end)
end
```
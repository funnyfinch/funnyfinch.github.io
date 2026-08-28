## basic usage
To start, let's apply flight in a very basic manner.
1. Import the flight `ModuleScript` into `ReplicatedStorage`
1. Start by inserting a `Script` into `ServerScriptService`
2. Inside the script, ensure that states are working
```lua
const flight = require("@game/ReplicatedStorage/flight")

const myNumber = flight.state.value(0)

print(myNumber:peek())

myNumber:set(5)

print(myNumber:peek())
```
```output
0
5
```
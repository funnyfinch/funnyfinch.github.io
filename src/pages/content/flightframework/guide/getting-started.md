## basic usage
Let's ensure flight is working.

To start, let's apply flight in a very basic manner.
1. Import the flight `ModuleScript` into `ReplicatedStorage`
1. Start by inserting a `Script` into `ServerScriptService`
2. Inside the script, try making a basic <a href="../libraries/state">state</a>
```lua
const flight = require("@game/ReplicatedStorage/flight")

const myNumber = flight.state.value(0)

print(myNumber:peek()) --> 0

myNumber:set(5)

print(myNumber:peek()) --> 5
```
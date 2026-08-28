## overview
- schemas are tables that contain instructions for writing to and reading from buffers
- 
- however, flight's schemas can be instantiated into schema states
## schema states
### values

### structs

### containers
```lua
const schema = require(path.to.flight).schema

const myState = schema.u8:instance(20) -- u8 range: 0 -> 255

myState:set(100)
print(myState:peek()) --> 100

myState:set(256) -- outside of range
print(myState:peek()) --> 100
```
# signal.new()
```luau
signal.new<P...>(config: signalConfig?): signal<P...>
```
## Methods
### signal:connect()
```luau
signal<P...>:connect(callback: (P...) -> (), config: connectionConfig?): connection<P...>
```
### signal:once()
```luau
signal<P...>:once(callback: (P...) -> (), config: connectionConfig?): connection<P...>
```
### signal:wait()
```luau
signal<P...>:wait(config: connectionConfig?, ...: P...)
```
Passing in arguments to the vararg `...` will yield the thread until the connection receives those arguments

# signal.wrap()
```luau
signal.wrap<P...>(robloxSignal: RBXScriptSignal): signal<P...>
```
# connection
```lua

```

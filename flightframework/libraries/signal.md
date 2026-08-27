A lightweight event primitive for communication between systems.

Signal provides a simple mechanism for registering callbacks and notifying those callbacks when an event occurs.

## Overview

Signals are useful when one part of a system needs to notify another part without creating a direct dependency between them.

A signal maintains a collection of callbacks. When the signal is fired, each connected callback receives the provided arguments.

## Creating a Signal

Create a new signal with `Signal.new()`.

```lua
local signal = Signal.new()
```

## Connecting

Use `:Connect()` to register a callback.

```lua
local signal = Signal.new()

local connection = signal:Connect(function(message)
    print(message)
end)
```

The callback is invoked whenever the signal is fired.

## Firing

Use `:Fire()` to notify every connected callback.

```lua
signal:Fire("Hello, world!")
```

Arguments passed to `:Fire()` are forwarded to every connected callback.

```lua
signal:Connect(function(player, message)
    print(player.Name, message)
end)

signal:Fire(player, "Hello!")
```

## Disconnecting

`:Connect()` returns a connection object.

```lua
local connection = signal:Connect(function()
    print("received")
end)

connection:Disconnect()
```

After disconnecting, the callback will no longer receive events.

### Automatic Cleanup

Connections should be disconnected when their owning object is destroyed or no longer requires the event.

```lua
local connection = signal:Connect(function()
    -- Handle event
end)

object.Destroying:Once(function()
    connection:Disconnect()
end)
```

## Once

Use `:Once()` when a callback should only execute once.

```lua
signal:Once(function(message)
    print(message)
end)

signal:Fire("first")
signal:Fire("second")
```

The callback receives the first event and is then automatically disconnected.

## Waiting

A thread can wait for the next event using `:Wait()`.

```lua
local message = signal:Wait()

print(message)
```

Arguments passed to the next `:Fire()` call are returned from `:Wait()`.

## API

### Signal.new()

Creates a new signal.

```lua
local signal = Signal.new()
```

Returns a new Signal.

### Signal:Connect(callback)

Connects a callback to the signal.

```lua
local connection = signal:Connect(callback)
```

Returns a Connection.

### Signal:Once(callback)

Connects a callback that automatically disconnects after the first invocation.

```lua
signal:Once(callback)
```

Returns a Connection.

### Signal:Fire(...)

Invokes every connected callback with the supplied arguments.

```lua
signal:Fire(...)
```

### Signal:Wait()

Yields the current thread until the signal is fired.

```lua
local value = signal:Wait()
```

Returns the arguments supplied to the next `:Fire()`.

### Connection:Disconnect()

Removes the callback associated with the connection.

```lua
connection:Disconnect()
```

## Example

A small example using several Signal features:

```lua
local signal = Signal.new()

local connection = signal:Connect(function(message)
    print("Received:", message)
end)

signal:Fire("Hello!")

connection:Disconnect()

signal:Once(function(message)
    print("Received once:", message)
end)

signal:Fire("First")
signal:Fire("Second")
```

The regular connection receives `"Hello!"`, while the `Once` connection only receives `"First"`.

## Design Notes

Signal is intentionally a small abstraction.

It should handle communication between systems without becoming responsible for the lifecycle of those systems.

Ownership should remain explicit. The object that creates a connection should generally be responsible for disconnecting it.

This makes signal usage predictable and prevents connections from surviving longer than their intended lifetime.
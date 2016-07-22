module.exports = function(controller) {
  return {
    connectCerebral: function (statePaths, signalPaths) {
      var tag = this

      tag.on('update', function() {
        tag.renderStart = new Date()
      })

      tag.on('updated', function() {

        const tagName = tag.root.tagName.toLowerCase()
        var map = {}

        Object.keys(statePaths).forEach(function(key) {
          map[statePaths[key].join('.')] = [tagName]
        })

        var event = new CustomEvent('cerebral.dev.components', {
          detail: {
            map: map,
            render: {
              start: tag.renderStart,
              duration: (new Date()) - tag.renderStart,
              // TODO: calculate changes; this event trigger may need moved somehow to controller.on('change'
              changes: {},
              components: [tagName]
            }
          }
        })
        window.dispatchEvent(event)

      })

      // Attach signals to tag
      if(signalPaths) {
        Object.keys(signalPaths).forEach(function(key) {
          tag[key] = controller.getSignals(signalPaths[key])
        })
      }

      // Attach state and udpate tag on state changes
      if(statePaths) {
        var updateState = function() {
          var shouldUpdate = false

          Object.keys(statePaths).forEach(function(key) {
            var newState = controller.get(statePaths[key])
            if (tag[key] !== newState) {
              tag[key] = newState
              shouldUpdate = true
            }
          })

          if(shouldUpdate) {
            tag.update()
          }
        }

        // Setup state listener and cleanup logic
        controller.on('change', updateState)
        tag.on('unmount', function() {
          controller.removeListener('change', updateState)
        })

        // Init
        updateState()
      }
    }
  }
}

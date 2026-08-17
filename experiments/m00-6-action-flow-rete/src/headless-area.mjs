export function createHeadlessAreaClass(BaseAreaPlugin) {
  return class HeadlessAreaPlugin extends BaseAreaPlugin {
    constructor() {
      super('electrocraft-headless-area')
      this.nodeViews = new Map()
      this.connectionViews = new Map()
      this.area = { pointer: { x: 0, y: 0 }, content: { holder: null, add() {}, reorder() {}, remove() {} } }
      this.addPipe(context => {
        if (!context || typeof context !== 'object' || !('type' in context)) return context
        if (context.type === 'nodecreated') this.addNodeView(context.data)
        if (context.type === 'noderemoved') this.removeNodeView(context.data.id)
        if (context.type === 'connectioncreated') this.addConnectionView(context.data)
        if (context.type === 'connectionremoved') this.removeConnectionView(context.data.id)
        return context
      })
    }

    addNodeView(node) {
      const area = this
      const view = {
        element: null,
        position: { x: 0, y: 0 },
        async translate(x, y) {
          const previous = { ...view.position }
          view.position = { x, y }
          await area.emit({ type: 'nodetranslated', data: { id: node.id, position: { ...view.position }, previous } })
          return true
        },
        async resize() { return true }
      }
      this.nodeViews.set(node.id, view)
      return view
    }

    removeNodeView(id) { this.nodeViews.delete(id) }
    addConnectionView(connection) {
      const view = { element: null }
      this.connectionViews.set(connection.id, view)
      return view
    }
    removeConnectionView(id) { this.connectionViews.delete(id) }
    async update() { return true }
    async resize() { return true }
    async translate(id, position) {
      const view = this.nodeViews.get(id)
      return view ? view.translate(position.x, position.y) : false
    }
    destroy() {
      this.nodeViews.clear()
      this.connectionViews.clear()
    }
  }
}

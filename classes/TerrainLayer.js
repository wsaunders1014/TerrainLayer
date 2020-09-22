//TERRAIN LAYER
export class TerrainHighlight extends PIXI.Graphics {
  constructor(name,...args){
    super(...args);

    /**
     * Track the Grid Highlight name
     * @type {String}
     */
    this.name = name;

    /**
     * Track distinct positions which have already been highlighted
     * @type {Set}
     */
    this.positions = new Set();
  }

  /* -------------------------------------------- */

  /**
   * Record a position that is highlighted and return whether or not it should be rendered
   * @param {Number} x    The x-coordinate to highlight
   * @param {Number} y    The y-coordinate to highlight
   * @return {Boolean}    Whether or not to draw the highlight for this location
   */
  highlight(x, y) {
    let key = `${x}.${y}`;
    if ( this.positions.has(key) ) return false;
    this.positions.add(key);
    return true;
  }

  /* -------------------------------------------- */

  /**
   * Extend the Graphics clear logic to also reset the highlighted positions
   * @param args
   */
  clear(...args) {
    super.clear(...args);
    this.positions = new Set();
  }


  /* -------------------------------------------- */

  /**
   * Extend how this Graphics container is destroyed to also remove parent layer references
   * @param args
   */
  destroy(...args) {
    delete canvas.terrain.highlightLayers[this.name];
    super.destroy(...args);
  }
}
export class TerrainLayer extends CanvasLayer{
	constructor(scene){
		super();
    this.configName = `DifficultTerrainConfig.${scene._id}`;
    this.activeName = `DifficultTerrain.${scene._id}`;
		this.costGrid = scene.getFlag('TerrainLayer','costGrid') || {};
    this.highlightLayers = {};
    this.highlight = null;
    this.mouseInteractionManager = null;
	}
  async draw(){
    await super.draw();
    this.highlight = this.addChild(new PIXI.Container());
    this.addHighlightLayer(this.configName);
     this._addListeners();
    return this;
  }
  _addListeners() {

    // Remove all existing listeners
    ///canvas.stage.removeAllListeners();

    // Define callback functions for mouse interaction events
    const callbacks = {
      clickLeft: this._onClickLeft.bind(this),
      dragLeftStart: this._onDragLeftStart.bind(this),
      dragLeftMove: this._onDragLeftMove.bind(this),
      clickRight: this._onClickRight.bind(this),
      dragRightMove: this._onDragRightMove.bind(this)
    };

    // Create and activate the interaction manager
    const permissions = {};
    const mgr = new MouseInteractionManager(this, this, permissions, callbacks);
    this.mouseInteractionManager = mgr.activate();
  }
  addHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( !layer || layer._destroyed ) {
      this.highlightLayers[name] = this.highlight.addChild(new TerrainHighlight(name));
    }
    return this.highlightLayers[name];
  }
  getHighlightLayer(name) {
    return this.highlightLayers[name];
  }
  /**
   * Clear a specific Highlight graphic
   * @param name
   */
  clearHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    if ( layer ) layer.clear();
  }

  /* -------------------------------------------- */

  /**
   * Destroy a specific Highlight graphic
   * @param name
   */
  destroyHighlightLayer(name) {
    const layer = this.highlightLayers[name];
    this.highlight.removeChild(layer);
    layer.destroy();
  }
  highlightPosition(name, options) {
    const layer = this.highlightLayers[name];
    if ( !layer ) return false;
    this.highlightGridPosition(layer, options);
  }
  /** @override */
  highlightGridPosition(layer , {x, y, color=0x33BBFF, border=null, alpha=0.25}={}) {
    if ( !layer.highlight(x, y) ) return;
    let s = canvas.dimensions.size;
    layer.beginFill(color, alpha);
    if ( border ) layer.lineStyle(2, border, Math.min(alpha*1.5, 1.0));
    layer.drawRect(x, y, s, s);
  }
	_registerMouseListeners() {
	    this.addListener('pointerdown', this._pointerDown);
	    this.addListener('pointerup', this._pointerUp);
	    this.addListener('pointermove', this._pointerMove);
	    this.dragging = false;
	}
	_registerKeyboardListeners() {
  	$(document).keydown((event) => {
  		console.log('test')
  		//if (ui.controls.activeControl !== this.layername) return;
  		switch(event.which){
  			case 27:
  				event.stopPropagation();
  				ui.menu.toggle();
  			break;
  			default:
  			break;
  		}
  	});
	}
	_deRegisterMouseListeners(){
		this.removeListener('pointerdown', this._pointerDown);
    this.removeListener('pointerup', this._pointerUp);
    this.removeListener('pointermove', this._pointerMove);
	}
	_deRegisterKeyboardListeners(){
		$(document).off('keydown')
	}
	_pointerDown(e) {
		//console.log('pointerdown',e,e.data.origin,e.data.destination)
    if(ui.controls.activeControl != 'terrain') return false;


    let pos = e.data.getLocalPosition(canvas.app.stage);
    //console.log(`x: ${pos.x}, y: ${pos.y}`);
    let gridPt = canvas.grid.grid.getGridPositionFromPixels(pos.x,pos.y);
    //Normalize the returned data because it's in [y,x] format
    let [y,x] = gridPt;
    let gs = canvas.dimensions.size;
    console.log(x,y)
    switch(e.data.button){
      case 0:
          //Left Mouse Click
         
          if(ui.controls.activeTool == 'select'){
            this.addToCostGrid(x,y);
            this.highlightPosition(this.configName,{x:x*gs,y:y*gs})
            //canvas.grid.highlightPosition(this.configName , {x:gridPt[1] * canvas.grid.size, y:gridPt[0] * canvas.grid.size})
            
          }
        break;
      default:
        break;
    }
	}
	_pointerMove(e) {

	}
	_pointerUp(e) {
	}
	_keyDown(e){

	}
  addToCostGrid(x,y){
    if(this.costGrid[x] != 'undefined')
      this.costGrid[x] = {}
    this.costGrid[x][y]={multiple:1,type:'ground'};
    canvas.scene.setFlag('TerrainLayer','costGrid',this.costGrid)
   
  }
  
	
  resetGrid(){
    this.configGrid.clear();
    this.activeGrid.clear();
  }
  selectObjects(){
    console.log('test')
  }
  _onDragLeftStart(e){
    console.log('_onDragLeftStart')
  }
  _onClickLeft(e){
    console.log('clickLeft')
  }
  _onDragLeftMove(e){
    console.log('dragMove')
  }
  _onClickRight(e){
    
  }
  _onDragRightMove(event) {

    // Extract event data
    const DRAG_SPEED_MODIFIER = 0.8;
    const {cursorTime, origin, destination} = event.data;
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;

    // Update the client's cursor position every 100ms
    const now = Date.now();
    if ( (now - (cursorTime || 0)) > 100 ) {
      if ( canvas.controls ) canvas.controls._onMoveCursor(event, destination);
      event.data.cursorTime = now;
    }

    // Pan the canvas
    canvas.pan({
      x: canvas.stage.pivot.x - (dx * DRAG_SPEED_MODIFIER),
      y: canvas.stage.pivot.y - (dy * DRAG_SPEED_MODIFIER)
    });

    
  }
  activate() {
    console.log('activate')
    super.activate();
    canvas.terrain.getHighlightLayer(this.configName).visible = true;
    this.interactive = true;
   // this._registerMouseListeners();
    //this._registerKeyboardListeners();

      //TODO: Show GRID HIGHLIGHT OF EXISTING POINTS
  }
	/**
	* Actions upon layer becoming inactive
	*/
	deactivate() {
		super.deactivate();
		this.interactive = false;
    canvas.terrain.getHighlightLayer(this.configName).visible = false;
		this._deRegisterMouseListeners();
		this._deRegisterKeyboardListeners();

    //TODO: Hide grid highlight layer
	}
}
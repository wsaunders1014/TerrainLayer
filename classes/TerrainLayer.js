//TERRAIN LAYER
let TLControlPress = false;
class TerrainSquare extends PIXI.Graphics {
  constructor(coord,...args){
    super(...args);
    this.coord = coord;
    this.thePosition = `${coord.x}.${coord.y}`;
   
  }
}
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
    console.log('TerrainLayer')
    this.scene = scene;
    this.sceneId = this.scene._id;
    this.layerName = `DifficultTerrain.${this.scene._id}`;
    console.log(scene.getFlag('TerrainLayer','costGrid'))
		
    
    this.highlight = null;
    this.mouseInteractionManager = null;
    this.dragging = false;
    this._addListeners();
    
    
    //Hooks.on('canvasReady', (scene, data) => this._updateScene(scene, data));
	}
  async draw(){
    console.log('Terrain Draw')
    await super.draw();
    this.highlightLayers = {};
     this.scene = canvas.scene;
    this.sceneId = this.scene._id;
    this.layerName = `DifficultTerrain.${this.scene._id}`;
    this.highlight = this.addChild(new PIXI.Container());
    this.addHighlightLayer(this.layerName);
    this.costGrid = this.scene.getFlag('TerrainLayer','costGrid') || {};
    this.buildFromCostGrid();
    return this;
  }
  refreshScene(scene) {
    console.log(scene,this)
    //need to reset data based on scene.
   
     //this.getHighlightLayer(this.layerName).clear();
     //this.getHighlightLayer(this.layerName).removeChildren();
    // delete canvas.terrain.highlightLayers[this.layerName];
   //  this.scene = scene;
   //  this.sceneId = scene._id;
   //  this.layerName = `DifficultTerrain.${scene._id}`;
   //  this.highlight.removeChildren();
   //  this.highlightLayers = {};
   // //this.highlight = null;
   //  //this.highlight = this.addChild(new PIXI.Container());
   //  this.addHighlightLayer(this.layerName);
   //  this.costGrid = scene.getFlag('TerrainLayer','costGrid') || {};
   //  this.buildFromCostGrid();
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
      dragRightMove: this._onDragRightMove.bind(this),
      dragLeftDrop:this._onDragLeftDrop.bind(this)
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
    let terrainSquare = new TerrainSquare({x:x,y:y})
    let offset = 15;
    terrainSquare.lineStyle(7, 0xffffff, 0.5);
    terrainSquare.moveTo(x+(s/2), y+offset);
    terrainSquare.lineTo(x+offset, y+s-offset);
    terrainSquare.lineTo(x+s-offset, y+s-offset);
    terrainSquare.lineTo(x+(s/2), y+offset);
    terrainSquare.closePath();
    terrainSquare.blendMode = PIXI.BLEND_MODES.OVERLAY;
    layer.addChild(terrainSquare)
    
  }
	_registerMouseListeners() {
	  //  this.addListener('pointerdown', this._pointerDown);
	    this.addListener('pointerup', this._pointerUp);
	 //   this.addListener('pointermove', this._pointerMove);
	    this.dragging = false;
	}
	_registerKeyboardListeners() {
  	$(document).keydown((event) => {
  		
  		//if (ui.controls.activeControl !== this.layername) return;
  		switch(event.which){
  			case 27:
  				event.stopPropagation();
  				ui.menu.toggle();
  			break;
        case 17:
          TLControlPress = true;
          break;
  			default:
  			break;
  		}
  	});
    $(document).keyup((event)=>{
      switch(event.which){
        case 17:
          TLControlPress = false;
          break;
        default:
        break;
      }
    })
	}
	_deRegisterMouseListeners(){
	//	this.removeListener('pointerdown', this._pointerDown);
    this.removeListener('pointerup', this._pointerUp);
   // this.removeListener('pointermove', this._pointerMove);
	}
	_deRegisterKeyboardListeners(){
		$(document).off('keydown')
    $(document).off('keyup');
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
         
          if(ui.controls.activeTool == 'add'){
            this.addToCostGrid(x,y);
            this.highlightPosition(this.layerName,{x:x*gs,y:y*gs})
          }
        break;
      default:
        break;
    }
	}
	_pointerMove(e) {

	}
	_pointerUp(e) {
    let pos = e.data.getLocalPosition(canvas.app.stage);
    let gridPt = canvas.grid.grid.getGridPositionFromPixels(pos.x,pos.y);
    let [y,x] = gridPt;  //Normalize the returned data because it's in [y,x] format
    let gs = canvas.dimensions.size;
    switch(e.data.button){
      case 0:
        if(game.activeTool == 'add' && !this.dragging){
          
          this.highlightPosition(this.layerName,{x:x*gs,y:y*gs})
          this.addToCostGrid(x,y);
          this.updateCostGridFlag()
        }else if(game.activeTool  == 'subtract'){
          const layer = canvas.terrain.getHighlightLayer(this.layerName);
          const key = `${x*gs}.${y*gs}`;
          this.removeDifficultTerrain(layer,x,y);
          this.removeFromCostGrid(x,y);
          this.updateCostGridFlag()
        }
      break;
      default:
      break;
    }
    this.dragging = false;
	}
	_keyDown(e){

	}
  removeFromCostGrid(x,y){
    if(typeof this.costGrid[x] == 'undefined') return false;
    if(typeof this.costGrid[x][y] == undefined) return false;
      
    delete this.costGrid[x][y];
      
      //this.scene.setFlag('TerrainLayer','costGrid',this.costGrid);
      //this.scene.update({[`flags.costGrid.${x}.-=${y}`]:null})
  }
  addToCostGrid(x,y){
   
    if(typeof this.costGrid[x] == 'undefined')
      this.costGrid[x] = {}
    this.costGrid[x][y]={multiple:1,type:'ground'};
    //await this.scene.setFlag('TerrainLayer',`costGrid.${x}.${y}`,{multiple:1,type:'ground'});
  }
  async updateCostGridFlag(){
    let x = this.costGrid
     await canvas.scene.unsetFlag('TerrainLayer','costGrid');
     await canvas.scene.setFlag('TerrainLayer','costGrid',x)
     console.log('updateCostGridFlag')
  }
	async buildFromCostGrid(){
    console.log('Terrain',this.costGrid)
    let gs = canvas.dimensions.size;
    for(let x in this.costGrid){
      for(let y in this.costGrid[x]){
        this.highlightPosition(this.layerName,{x:x*gs,y:y*gs})
      }
    }
  }
  async resetGrid(){
    this.getHighlightLayer(this.layerName).clear();
    this.getHighlightLayer(this.layerName).removeChildren();
    this.costGrid = {}
    this.scene.unsetFlag('TerrainLayer','costGrid');
  }
  selectSquares(coords){
    const gs = canvas.dimensions.size;
    const startX = Math.floor(coords.x / gs);
    const startY = Math.floor(coords.y / gs);
    const endX =  Math.floor((coords.width+coords.x)/gs);
    const endY = Math.floor((coords.height+coords.y)/gs);

    for(let x = startX;x<=endX;x++){
      for(let y = startY;y<=endY;y++){
        
        if(game.activeTool == 'add' && TLControlPress == false){
          this.highlightPosition(this.layerName,{x:x*gs,y:y*gs})
          this.addToCostGrid(x,y);
        }else if(game.activeTool == 'subtract' || TLControlPress){
          const layer = canvas.terrain.getHighlightLayer(this.layerName);
          const key = `${x*gs}.${y*gs}`;
          this.removeDifficultTerrain(layer,x,y)
          this.removeFromCostGrid(x,y);
        }
      }
    }
    this.updateCostGridFlag();
  }
  removeDifficultTerrain(layer,x,y){
     let gs = canvas.dimensions.size;
     const key = `${x*gs}.${y*gs}`;
    if(!layer.positions.has(key)) return false;
    let square = layer.children.find((x)=>{
      return x.thePosition == key
    })
    square.destroy();
    layer.positions.delete(key)
    

  }
  _onDragLeftStart(e){
    this.dragging = true;
    console.log('_onDragLeftStart')
  }
  _onClickLeft(e){
    //if(this.mouseInteractionManager._state)
   
  }
  _onDragLeftMove(e){
    console.log('dragMove')
    const isSelect = ["add","subtract"].includes(game.activeTool);
    if ( isSelect ) return this._onDragSelect(e);
  }
  _onDragSelect(event) {

    // Extract event data
    const {origin, destination} = event.data;

    // Determine rectangle coordinates
    let coords = {
      x: Math.min(origin.x, destination.x),
      y: Math.min(origin.y, destination.y),
      width: Math.abs(destination.x - origin.x),
      height: Math.abs(destination.y - origin.y)
    };

    // Draw the select rectangle
    canvas.controls.drawSelect(coords);
    event.data.coords = coords;
  }
  _onDragLeftDrop(e){
    //console.log(e.data.coords)
    const tool = game.activeTool;
    // Conclude a select event

    const isSelect = ["add","subtract"].includes(tool);
    if ( isSelect ) {
      canvas.controls.select.clear();
      canvas.controls.select.active = false;
      if ( tool === "add" || tool === "subtract") return this.selectSquares(e.data.coords);
    }
    canvas.controls.select.clear();
  }
  _onClickRight(e){
    /* DELETE TERRAIN SQUARE */
    let pos = e.data.getLocalPosition(canvas.app.stage);
    let gridPt = canvas.grid.grid.getGridPositionFromPixels(pos.x,pos.y);
    //Normalize the returned data because it's in [y,x] format
    let [y,x] = gridPt;
    let gs = canvas.dimensions.size;
    let key = `${x*gs}.${y*gs}`;
    if(game.activeTool == 'add'){
      const layer = canvas.terrain.getHighlightLayer(this.layerName);
      this.removeDifficultTerrain(layer,x,y);
      this.removeFromCostGrid(x,y);
    }
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
    console.log('Terrain activate')
    super.activate();
    this.interactive = true;
    this._registerMouseListeners();
    this._registerKeyboardListeners();

      //TODO: Show GRID HIGHLIGHT OF EXISTING POINTS
  }
	/**
	* Actions upon layer becoming inactive
	*/
	deactivate() {
    console.log('Terrain deactivate')
		super.deactivate();
		this.interactive = false;
		this._deRegisterMouseListeners();
		this._deRegisterKeyboardListeners();

    //TODO: Hide grid highlight layer
	}
}
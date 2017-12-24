class Dragger {

  constructor(element, handle, handleStyle, parent) {

    this.element = element;
    
    this.parent = parent || document.documentElement;

    this.setHandle(handle, handleStyle);

    this.init();

  }

  init() {

    // On / Off
    this.isEnabled = true;

    // Drag Status
    this.status = false;

    this.vertical = true;
    this.horizontal = true;

    this.boundary = false;

    this.events = {
      onMouseDown: this.start.bind(this),
      onMouseUp: this.stop.bind(this),
      onMouseMove: this.move.bind(this),
    };

    // Data Object
    this._data = {};

    // Functions
    this._method = {};

    this.createMethods();

    this._method.syncOffset();

    this.setEvents('init');
    
    this.parent.style.overflow = 'hidden';
    
  }

  setHandle(handle, handleStyle = {}) {

    const defaultHandleStyle = {
      position: 'absolute',
      top: '0px',
      left: '0px',
      width: '0px',
      height: '0px',
      boxShadow: 'inset 0px 0px 0px 5px #ffc000',
    };

    if (handle === true) {

      const handleElement = document.createElement('div');

      if (typeof handleStyle === 'string')
        handleElement.className = handleStyle;

      else if (typeof handleStyle === 'object')
        Object.assign(handleElement.style, handleStyle, defaultHandleStyle);
      
      this.handle = handleElement;

      this.parent.appendChild(this.handle);

    }
    else if (handle !== false) {

      if (typeof handle === 'object')
        this.handle = handle;

      else this.setHandle(true, handleStyle);

    }
    else this.handle = this.element;

  }

  setEvents(type) {

    if (type === 'init')
      this.handle.addEventListener('mousedown', this.events.onMouseDown);
      
    else if (type === 'add' || type === 'remove') {
      document.documentElement[`${ type }EventListener`]('mousemove', this.events.onMouseMove);
      document.documentElement[`${ type }EventListener`]('mouseup', this.events.onMouseUp);
    }

    if ('ontouchstart' in window) {

      if (type === 'init')
        this.handle.addEventListener('touchstart', this.events.onMouseDown);

      else if (type === 'add' || type === 'remove') {
        document.documentElement[`${ type }EventListener`]('touchmove', this.events.onMouseMove);
        document.documentElement[`${ type }EventListener`]('touchend', this.events.onMouseUp);
      }

    }
      
  }

  createMethods() {

    this._method.setCursorPosition = (event) => {
      
      this._data.cursor = {
        x: event.pageX,
        y: event.pageY,
        initialX: event.pageX,
        initialY: event.pageY,
      };

    };

    this._method.updateCursorPosition = (event) => {

      Object.assign(this._data.cursor, {
        x: event.pageX,
        y: event.pageY,
      });

    };

    this._method.setRange = (computedStyle, elementOffset) => {
      /*
        We are passing `computedStyle` & `elementOffset`
        so that it don't have to calculate those values again
        for performance boost
      */

      computedStyle = computedStyle || window.getComputedStyle(this.element);
      elementOffset = elementOffset || this.element.getBoundingClientRect();

      const range = {
        element: {
          minX: 0 - parseInt(computedStyle["marginLeft"]),
          minY: 0 - parseInt(computedStyle["marginTop"]),
          maxX: this.parent.clientWidth - elementOffset.width - parseInt(computedStyle["marginRight"]),
          maxY: this.parent.clientHeight - elementOffset.height - parseInt(computedStyle["marginBottom"]),
        },
        handle: {
          minX: 0,
          minY: 0,
          maxX: this.parent.clientWidth - elementOffset.width,
          maxY: this.parent.clientHeight - elementOffset.height,
        }
      };

      Object.assign(this._data.offset.element, range.element);
      Object.assign(this._data.offset.handle, range.handle);

    };

    this._method.syncOffset = () => {

      if (this._data.offset === undefined){
        this._data.offset = {
          element: {},
          handle: {},
        };
      }

      const computedStyle = window.getComputedStyle(this.element);
      const elementOffset = this.element.getBoundingClientRect();

      this._data.offset.element = {
        x: elementOffset.left - parseInt(computedStyle["marginLeft"]),
        y: elementOffset.top - parseInt(computedStyle["marginTop"]),
        width: elementOffset.width,
        height: elementOffset.height,
      };
      
      this._data.offset.handle = {
        x: elementOffset.left + this.parent.scrollLeft,
        y: elementOffset.top + this.parent.scrollTop,
        width: elementOffset.width,
        height: elementOffset.height,
      };

      Object.assign(this._data.offset.element, {
        initialX: this._data.offset.element.x,
        initialY: this._data.offset.element.y,
      });

      Object.assign(this._data.offset.handle, {
        initialX: this._data.offset.handle.x,
        initialY: this._data.offset.handle.y,
      });

      this._method.setRange(computedStyle, elementOffset);

      this._method.updateHandle();

    };

    this._method.updateOffset = (event) => {

      const element = this._data.offset.element;
      const handle = this._data.offset.handle;
      const cursor = this._data.cursor;

      this._data.offset.element.x = element.initialX + (event.pageX - cursor.initialX);
      this._data.offset.element.y = element.initialY + (event.pageY - cursor.initialY);

      this._data.offset.handle.x = handle.initialX + (event.pageX - cursor.initialX);
      this._data.offset.handle.y = handle.initialY + (event.pageY - cursor.initialY);

    };
    
    this._method.updateElement = (event) => {

      const element = this._data.offset.element;
      
      if (this.boundary) {
        element.x = (element.x < element.minX) ? element.minX : (element.x > element.maxX) ? element.maxX : element.x;
        element.y = (element.y < element.minY) ? element.minY : (element.y > element.maxY) ? element.maxY : element.y;
      }

      if (this.horizontal)
        this.element.style.left = element.x + 'px';
        
      if (this.vertical)
        this.element.style.top = element.y + 'px';

    };

    this._method.updateHandle = (event) => {

      if (this.handle === this.element) return undefined;

      const handle = this._data.offset.handle;

      if (this.boundary) {
        handle.x = (handle.x < handle.minX) ? handle.minX : (handle.x > handle.maxX) ? handle.maxX : handle.x;
        handle.y = (handle.y < handle.minY) ? handle.minY : (handle.y > handle.maxY) ? handle.maxY : handle.y;
      }

      if (this.horizontal)
        this.handle.style.left = handle.x + 'px';
        
      if (this.vertical)
        this.handle.style.top = handle.y + 'px';

      this.handle.style.width = handle.width + 'px';
      this.handle.style.height = handle.height + 'px';

      this.handle.style.transform = window.getComputedStyle(this.element)["transform"];
      this.handle.style.zIndex = window.getComputedStyle(this.element)["zIndex"];

    };

    this._method.treatEvent = (event) => {

      if (event.type === "mousemove") {
        
        event.preventDefault();  
        // Check if mouse is pressed
        // event.buttons will return 1, if mouse is left-clicked
        if (event.buttons !== 1) {
          // Turn off Resizing
          this.stop();
        }
  
      }
      
      event = (event.type.includes('touch')) ? event.targetTouches[0] : event;

      return event;

    };

  }
  


  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }
  


  start(event) {
    
    if (!this.isEnabled) return undefined;

    this.status = true;

    this.setEvents('add');
    
    event = this._method.treatEvent(event);
    


    this._method.syncOffset();

    this._method.setCursorPosition(event);
    

    
    if (typeof this.onDragMove === 'function')
      this.onDragStart();

  }

  stop(event) {
        
    this.status = false;
    
    this.setEvents('remove');
    
    
    
    if (typeof this.onDragMove === 'function')
      this.onDragEnd();

  }

  move(event) {
    
    if (!this.isEnabled) return undefined;
    if (!this.status) return undefined;
    
    event = this._method.treatEvent(event);
    

    
    this._method.updateOffset(event);

    this._method.updateElement(event);
    
    this._method.updateHandle(event);
    


    if (typeof this.onDragMove === 'function')
      this.onDragMove();

  }

}
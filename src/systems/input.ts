export interface InputState {
  forward: boolean;
  backward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  rollLeft: boolean;
  rollRight: boolean;
  fireLaser: boolean;
  fireMissile: boolean;
  boost: boolean;
  pause: boolean;
  mouseX: number;
  mouseY: number;
  isMouseDown: boolean;
}

export class InputManager {
  public keys: { [key: string]: boolean } = {};
  public mouseX = 0;
  public mouseY = 0;
  public isMouseDown = false;
  private pauseRequested = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  public attach() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  public detach() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.code === 'Escape') {
      this.pauseRequested = true;
    }
    this.keys[e.code] = true;
    this.keys[e.key] = true;
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keys[e.code] = false;
    this.keys[e.key] = false;
  }

  private handleMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private handleMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = true;
    }
  }

  private handleMouseUp(e: MouseEvent) {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  }

  public consumePause(): boolean {
    const req = this.pauseRequested;
    this.pauseRequested = false;
    return req;
  }

  public getState(): InputState {
    const k = this.keys;
    return {
      forward: !!(k['KeyW'] || k['ArrowUp'] || k['w'] || k['W']),
      backward: !!(k['KeyS'] || k['ArrowDown'] || k['s'] || k['S']),
      turnLeft: !!(k['KeyA'] || k['ArrowLeft'] || k['a'] || k['A']),
      turnRight: !!(k['KeyD'] || k['ArrowRight'] || k['d'] || k['D']),
      pitchUp: !!(k['ArrowDown']),
      pitchDown: !!(k['ArrowUp']),
      rollLeft: !!(k['KeyQ'] || k['q']),
      rollRight: !!(k['KeyE'] || k['e']),
      fireLaser: !!(k['Space'] || k[' '] || this.isMouseDown),
      fireMissile: !!(k['KeyF'] || k['f']),
      boost: !!(k['ShiftLeft'] || k['ShiftRight'] || k['Shift']),
      pause: this.pauseRequested,
      mouseX: this.mouseX,
      mouseY: this.mouseY,
      isMouseDown: this.isMouseDown,
    };
  }
}

import React, { Component } from 'react'
import './FamMap.css';

const WIDTH = 1300;
const HEIGHT = 1300;
const COLORS = ['#F23D5E',
  '#024059',
  '#05A696',
  '#F2C641',
  '#D9593D'];

const LINE_COLOR = "#333";
const LINE_WIDTH = 1;
const NODE_COLOR = "#333";
const NODE_SIZE = 8;
const NODE_LINE_WIDTH = 3;

const RAD = 150;
const PARTNER_RAD = 20;
const SIBLING_RAD =30;
// const SIBLING_RAD_DIM = 5;
const START_RAD = 120;
const OG_RAD = 50;

class FamMap extends Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.first = false;
    this.dotsQueue = [];
    this.textQueue = [];
  }

  componentDidMount() {
    if (this.first) return;
    this.first = true;
    this.setupCanvas();
    this.updateCanvas();
  }

  componentDidUpdate(nextProps, nextState) {
    this.updateCanvas();
  }

  setupCanvas() {
    const canvas = this.canvas.current;
    const ctx = this.canvas.current.getContext('2d');
    const scale = window.devicePixelRatio*1.5;
    canvas.style.width = WIDTH + "px";
    canvas.style.height = HEIGHT + "px";
    canvas.width = WIDTH * scale;
    canvas.height = HEIGHT * scale;
    ctx.scale(scale, scale);
  }

  updateCanvas() {
    console.log('update canvas');
    // ctx.fillRect(0,0, 100, 100);
    const famTree = this.props.data.getFamilyTree();
    const ctx = this.canvas.current.getContext('2d');
    console.log(famTree[0]);
    this.dotsQueue = [];
    this.textQueue = [];

    const zoomedIn = this.props.zoomedIn;
    const scale = zoomedIn ? 1.5 : 1;
      // const canvas = this.canvas.current;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // ctx.scale(window.devicePixelRatio*scale,window.devicePixelRatio*scale);

    this.drawRings();
    this.mapChildren(famTree[0].children, 1);

    this.processDotsQueue();
    this.processTextQueue();
    // ctx.scale(window.devicePixelRatio,window.devicePixelRatio);
    // console.log(window.devicePixelRatio, scale)
  }


  /*--------------------------------------------
  Draw
  ---------------------------------------------*/

  mapChildren(children, gen, stepParent) {
    const len = children.length;
    const slice = Math.PI*2/len;
    const RADG = this.getRadius(gen);
    const genMax = this.props.data.getGenMax();
    const genSize = this.props.data.getGenSize(gen);
    // const rot = 0;


    for (let i = 0; i < len; i++) {
      let child = children[i];
      let index = 0;
      let parent = child.parent;

      for (let k = 0; k < child.childIndex; k++) {
        index += children[k].weight
      }
      if (stepParent) {
        const len = stepParent.children.length;

        if (!(stepParent.partners.length > 1 && parent.partnerIndex === 1)) {
          // index += cLen;
          for (let k = 0; k < len; k++) {
            index += stepParent.children[k].weight
          }
        }
      }
      if (parent.partners && parent.partners.length) {
        for (let j = 0; j < parent.partners.length; j++) {
          if (parent.partners[j].children) {
            const len = parent.partners[j].children.length;

            if (parent.partners.length > 1 && parent.partners[1].children.length) {
              for (let k = 0; k < len; k++) {
                index += parent.partners[j].children[k].weight
              }
            }
          }
        }
      }

      if (gen > 2) {
        let sp = SIBLING_RAD;
        let ptr = Math.asin(sp/RADG);
        let offset = (child.sibSize)/2;

        let pr = this.getParentCoordinates(child);
        index += (child.weight/2);
        child.r = pr + (ptr*(index-offset));
      }
      else {
        var size = child.size/2 + child.abSize;
        child.r = (((Math.PI*2)/genSize) * size);
      }

      this.drawIndividual(child, gen, null)

      if (child.children) {
        this.mapChildren(child.children, gen+1);
      }
    }
  }

  drawIndividual(item, gen, partner, reverseIndex) {
    const ctx = this.canvas.current.getContext('2d');
    let r = item.r;
    let pr = this.getParentCoordinates(item);
    let start = {};
    const RADG = this.getRadius(gen);
    const c = [WIDTH/2, HEIGHT/2];
    // const rot = this.props.rotation*(1/180*Math.PI);

    if (partner) {
      let ptr = Math.asin(PARTNER_RAD/RADG);
      r = partner.r + ptr;
      if (reverseIndex) {
        r = partner.r - ptr*reverseIndex;
      }
      start = {x:partner.x, y:partner.y};
    }
    else {
      if (gen === 0) {
        start = {x:c[0], y:c[1]};
      }
      else if (gen === 1) {
        start = {x:c[0], y:c[1]};
      }
      else {
        const offset = RAD;
        start.x = c[0] + Math.cos(pr)*(RADG-offset);
        start.y = c[1] + Math.sin(pr)*(RADG-offset);
      }
    }

    if (typeof r === 'undefined' || r === null) {
      console.log('R missing', item.NAME);
    }

    let offset = RAD*0.25;

    if (gen > 2 && item.parent && !item.parent.parent) {
      // console.log(item.NAME);
      offset = RAD*0.1;
    }
    let x1 = c[0] + Math.cos(pr)*(RADG-offset);
    let y1 = c[1] + Math.sin(pr)*(RADG-offset);
    let x2 = c[0] + Math.cos(r)*RADG;
    let y2 = c[1] + Math.sin(r)*RADG;
    let s = NODE_SIZE; // size
    let isEx = partner && item.EX_PARTNERS.length > 0;
    item.x = x2;
    item.y = y2;
    item.r = r;

    ctx.lineWidth = LINE_WIDTH;
    ctx.strokeStyle = LINE_COLOR;
    if (isEx) {
      ctx.setLineDash([2, 2]);
    }
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    if (gen > 1 && !partner) {
      if (item.parent.children.length > 1 && item.id !== item.parent.children[0].id) {
        // ctx.moveTo(x1, y1);
      }
      else {
        // ctx.lineTo(x1, y1);
      }


      ctx.bezierCurveTo(x1, y1, x1, y1, x2, y2);
    }
    else {
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    let text = item.NAME + ' ' + item.SURNAME;// + '(' + item.sibSize + ')';

    if (this.props.language === 1) {
      if (item.JAPANESE_NAME) {
        text = item.JAPANESE_NAME;
      }
    }

    this.dotsQueue.push({x:x2, y:y2, r:s/2, isEx:isEx});
    this.textQueue.push({text:text, r:r, x:RADG+s/2});


    if (item.partners) {
      for (let i = 0; i < item.partners.length; i++) {
        let partner = item.partners[i];
        this.drawIndividual(partner, gen, item, i);

        if (partner.children) {
          this.mapChildren(partner.children, gen+1, item);
        }
      }
    }
  }

  processDotsQueue() {
    const ctx = this.canvas.current.getContext('2d');

    for (let item of this.dotsQueue) {

      ctx.lineWidth = NODE_LINE_WIDTH;
      ctx.beginPath();
      ctx.strokeStyle = ctx.fillStyle = NODE_COLOR;

      if (item.isEx) {
        // ctx.setLineDash([2, 1]);
        ctx.arc(item.x, item.y, item.r-1, 0, 2 * Math.PI, false);
        ctx.stroke();
      }
      else {
        ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI, false);
        ctx.fill();
      }

      ctx.setLineDash([]);
    }
  }

  processTextQueue() {
    const ctx = this.canvas.current.getContext('2d');
    const c = [WIDTH/2, HEIGHT/2];
    let r0 = 0;

    ctx.translate(c[0], c[1]);

    for (let item of this.textQueue) {
      const r1 = item.r - r0;
      ctx.font = '10px sans-serif';
      ctx.rotate(r1, c[0], c[1]);
      // ctx.rotate(item.r, c[0], c[1]);
      let txtSize = ctx.measureText(item.text);
      ctx.fillStyle = '#fff';
      ctx.fillRect(item.x+2, -4, txtSize.width+2, 10);
      ctx.fillStyle = '#000000';
      ctx.fillText(item.text, item.x+2, 3);

      // ctx.rotate(-item.r, c[0], c[1]);
      r0 = item.r;
    }
    ctx.rotate(-r0, c[0], c[1]);
    ctx.translate(-c[0], -c[1]);
  }

  drawRings() {
    const ctx = this.canvas.current.getContext('2d');
    const c = [WIDTH/2, HEIGHT/2];
    const genMax = this.props.data.getGenMax();

    for (let i = 0; i < genMax-1; i++) {
      let RADG = this.getRadius(i+1);
      ctx.beginPath();
      ctx.lineWidth = 10;
      ctx.strokeStyle = COLORS[i];
      ctx.globalAlpha = 0.1;
      ctx.arc(c[0], c[1], RADG, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /*--------------------------------------------
  Utils
  ---------------------------------------------*/

  getRadius(gen) {
    return START_RAD + RAD*(gen-1);
  }

  getParentCoordinates(item) {
    let pr = item.parent ? item.parent.r : item.r;
    if (item.parent && item.parent.partners) {
      for (let p of item.parent.partners) {
        if (p.id === item.FATHER || p.id === item.MOTHER) {
          pr = (p.r + item.parent.r)/2;
        }
      }
    }
    return pr;
  }

  render() {
    const husband = this.props.data.getFamilyTree()[0];
    const wife = husband.partners[0];
    const zoomedIn = this.props.zoomedIn;
    const wrapClass = zoomedIn ? " shift" : " ";

    const style = {
      transform: "rotate(" + this.props.rotation + "deg)"
    }
    return (
      <div className={"FamMap-wrap" + wrapClass}>
        <canvas className="FamMap-canvas" ref={this.canvas} width={WIDTH} height={HEIGHT} style={style}/>
        <div className="FamMap-origin-group">
          <div className="FamMap-origin">{husband.NAME}<br/>{husband.SURNAME}</div>
          <div className="FamMap-origin-spacer"></div>
          <div className="FamMap-origin">{wife.NAME}<br/>{wife.SURNAME}</div>
        </div>
      </div>
    );
  }
}

export default FamMap;

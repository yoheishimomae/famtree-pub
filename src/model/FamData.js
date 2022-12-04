var famData = [];
var genMax = 0;
var genIndex = [];
var lastNode = [];
var lastBranch = [];
var lineNodes = [];
var lineQueue = [];
var textQueue = [];
var genSize = [];
var rawCSV = {};
const SHOW_ORIGIN = true;
const ENABLE_PARTNER_BRANCH = true;

export default class FamData {

  constructor(data) {
    this.sortData(data.data);
  }

  sortData(csv) {
    for (let item of csv) {
      if (item.id === 'START') {
        item.r = 0;
        famData.push(item);
      }
    }
    rawCSV = csv;

    // famData.sort(sortByAge);
    this.searchKids(famData[0], csv, 1);
    this.searchPartners(famData[0], csv);
    // console.log(famData[0]);
    this.calculateSize(famData[0], 0);
  }

  /*--------------------------------------------
  Searcher
  ---------------------------------------------*/

  searchKids(item, csv, gen, excludeID) {
    if (gen > genMax) genMax = gen;
    var kids = this.searchByKeyId(csv, item.id, ['FATHER', 'MOTHER']);

    if (kids.length) {
      // Make sure it's not duplicate
      for (let i = 0; i < kids.length; i++) {
        let kid = kids[i];

        if (kid.FATHER === excludeID || kid.MOTHER === excludeID) {
          kids.splice(i, 1);
          i--;
        }
      }
    }

    kids.sort(this.sortByAge);

    item.children = kids;

    for (let i = 0; i < kids.length; i++) {
      let kid = kids[i];

      kid.childIndex = i;

      this.searchKids(kid, csv, gen + 1);
      this.searchPartners(kid, csv, gen);
      kid.parent = item;
    }
  }

  searchPartners(item, csv, gen) {
    var partners = this.searchByKeyId(csv, item.id, ['PARTNER', 'EX_PARTNERS']);
    item.weight = 1;
    if (partners.length) {

      for (let i = 0; i < partners.length; i ++) {
        let partner = partners[i];
        // partner.partner = item;
        partner.partnerIndex = i;
        partner.childIndex = item.childIndex;
        if (ENABLE_PARTNER_BRANCH) {
          this.searchKids(partner, csv, gen + 1, item.id);
        }
      }

      item.partners = partners;
      item.weight += partners.length;
    }
  }


  /*--------------------------------------------
  ID Searcher and Sorter
  ---------------------------------------------*/

  calculateSize(item, gen, partner) {
    item.size = this.getSize(item);
    item.branchSize = this.getBranchSize(item);

    if (!genSize[gen]) genSize[gen] = 0;

    item.abSize = genSize[gen];
    item.sibSize = 0;

    if (item.parent) {
      let len = item.parent.children.length;
      for (let i = 0; i < len; i++) {
        let sib = item.parent.children[i];
        item.sibSize += sib.weight;
      }
    }
    if (item.parent && item.parent.partners) {
      let ptn = item.parent.partners;
      for (let i = 0; i < ptn.length; i++) {
        if (ptn[i].children) {
          for (let j = 0; j < ptn[i].children.length; j++) {
            item.sibSize += ptn[i].children[j].weight;
          }
        }
      }
    }

    if (!partner) {
      genSize[gen] += item.size;
    }

    if (item.parent && (item.parent.PARTNER && item.parent.partnerIndex > -1)) {
      let ptn = this.searchById(item.parent.PARTNER, 'id')[0];

      if (ptn.children) {
        for (let j = 0; j < ptn.children.length; j++) {
          item.sibSize += ptn.children[j].weight;
        }
      }
    }
    if (item.children && item.children.length) {

      for (let i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        this.calculateSize(child, gen+1);
      }
    }

    if (item.partners && item.partners.length) {
      for (let i = 0; i < item.partners.length; i++) {
        this.calculateSize(item.partners[i], gen, item);
      }
    }
  }

  getSize(item) {
    let count = {i:2};
    this.getSizeLoop(item, count);
    return count.i;
  }

  getSizeLoop(item, count, partner) {
    if (item.children && item.children.length) {
      count.i += item.children.length;
    }

    if (item.partners && item.partners.length && !partner) {
      count.i += item.partners.length;
      for (let i = 0 ; i < item.partners.length; i++) {

        if (item.partners[i].children) {
          count.i += item.partners[i].children.length;
        }
      }
    }
  }

  getBranchSize(item) {
    let count = {i:1};
    this.getBranchSizeLoop(item, count);
    return count.i;
  }

  getBranchSizeLoop(item, count, partner) {
    if (item.children && item.children.length) {
      count.i += item.children.length;

      for (let i = 0 ; i < item.children.length; i++) {
        this.getBranchSizeLoop(item.children[i], count);
      }
    }

    if (item.partners && item.partners.length && !partner) {
      count.i += item.partners.length;
      for (let i = 0 ; i < item.partners.length; i++) {
        this.getBranchSizeLoop(item.partners[i], count, item);
      }
    }
  }

  sortByAge(a, b) {
    if (a.BORN && a.BORN.length && b.BORN && b.BORN.length) {
      const ad = new Date(a.BORN);
      const bd = new Date(b.BORN);
      return ad.getFullYear() - bd.getFullYear();
    }
    return a.BORN - b.BORN;
  }

  // searchById(csv, uid) {
  //   for (let item of csv) {
  //     if (item.id === uid) {
  //       return item;
  //       break;
  //     }
  //   }
  //   return null;
  // }

  searchByKeyId(csv, uid, keys) {
    var ar = [];
    for (let item of csv) {
      for (let key of keys) {
        if (item[key].indexOf(uid) > -1) {
          ar.push(item);
        }
      }
    }
    // console.log('no match');
    return ar;
  }

  searchById(uid, key) {
    var ar = [];
    for (let item of rawCSV) {
      if (item[key].indexOf(uid) > -1) {
        ar.push(item);
      }
    }
    return ar;
  }

  /*--------------------------------------------
  Getter
  ---------------------------------------------*/

  getFamilyTree() {
    return famData;
  }

  getGenMax() {
    return genMax;
  }

  getGenSize(gen) {
    return genSize[gen];
  }

  getBranch(index) {
    genIndex = [];
    lastBranch = [];
    lastNode = [];
    lineNodes = [];
    lineQueue = [];
    textQueue = [];

    const fam = famData[0].children[index];
    const gIndex = SHOW_ORIGIN ? 0 : 1;
    // FIX parent child relation
    let p2;
    if (SHOW_ORIGIN) {
      p2 = Object.assign({}, famData[0]);
      p2.children = [fam];
    }
    else {
      p2 = fam;
    }

    this.mapPosition(p2, gIndex);
    this.recalculatePosition(p2, gIndex);
    this.recalculateGroups(fam, 1);
    this.generateLines(p2, gIndex);

    return {texts: textQueue, lines:lineQueue};
  }

  /*--------------------------------------------
  Branch
  ---------------------------------------------*/

  mapPosition(item, gen, partner) {
    const NODE_SPACE = 70;
    const BRANCH_SPACE = (gen === 2 ? 70 : 30);
    const PAD_X = SHOW_ORIGIN ? 260 : 120;
    const SPACE = 260;
    const NODE_OFFSET = 50;

    if (item.partners && item.partners.length > 1) {
      this.mapPosition(item.partners[1], gen, item);
    }
    if (!genIndex[gen]) {
      genIndex[gen] = (gen === 2 ? -BRANCH_SPACE : 0);
    }

    if (gen === 2) {
      let pt = partner ? partner : item;
      if ((pt.childIndex && pt.childIndex !== (lastBranch[gen] && lastBranch[gen].childIndex)) || (pt.id !== (lastBranch[gen] && lastBranch[gen].id))) {
        lastBranch[gen] = pt;
        genIndex[gen] += BRANCH_SPACE;
      }
    }
    else if (gen === 4) {
      // console.log(gen)
      const pt1 = partner ? partner.parent : item.parent;
      const pt2 = partner ? partner.parent.parent : item.parent.parent;
      let pid = (pt1 && pt1.childIndex) ? pt1.childIndex.toString() : null;

      if (pt2 && pt2.childIndex) {
        pid += pt2.childIndex.toString();
      }

      if (pid && pid !== lastBranch[gen]) {
        lastBranch[gen] = pid;
        genIndex[gen] += BRANCH_SPACE;
      }
    }

    let y = genIndex[gen];
    let x = PAD_X + SPACE*(gen -1) + NODE_OFFSET;

    item.x = x;
    item.y = y;

    genIndex[gen] += (gen === 1) ? NODE_SPACE*1.2 : NODE_SPACE;

    if (item.children && item.children.length && (!partner || ENABLE_PARTNER_BRANCH)) {

      for (let i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        this.mapPosition(child, gen+1, null, i);
      }
    }

    if (item.partners && item.partners.length) {
      for (let i = 0; i < item.partners.length; i++) {
        if (i !== 1) {
          this.mapPosition(item.partners[i], gen, item);
        }
      }
    }
  }

  recalculatePosition(item, gen, partner) {
    const WIDTH = 1200;
    const HEIGHT = 1200;
    const C = [WIDTH/2, HEIGHT/2];
    const OFFSET_Y = C[1] - genIndex[gen]/2;

    item.y += OFFSET_Y;

    if (item.partners) {
      for (let i = 0; i < item.partners.length; i++) {
        this.recalculatePosition(item.partners[i], gen, item);
      }
    }

    if (item.children && item.children.length && (!partner || ENABLE_PARTNER_BRANCH)) {
      for (let i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        this.recalculatePosition(child, gen+1);
      }
    }
  }

  recalculateGroups(item, gen, partner) {
    const WIDTH = 1200;
    const HEIGHT = 1200;
    const C = [WIDTH/2, HEIGHT/2];
    const NODE_SPACE = 70;

    if (gen === 4 && genIndex[gen] < genIndex[gen-1] && !partner) {
      let childCount = 0;

      for (let i = 0; i < item.parent.children.length; i++) {
        childCount++;
        if (item.parent.children[i].partners) {
          childCount += item.parent.children[i].partners.length;
        }
      }

      const parents = this.getParentCoordinates(item);
      let offset = parents.y - ((childCount-1)*NODE_SPACE)/2 + item.childIndex*NODE_SPACE;

      // Prevent overlap
      if (lastNode[gen] + NODE_SPACE > offset) {
        console.log(item.NAME);
        offset = lastNode[gen] + NODE_SPACE;
      }


      let diff = offset - item.y;
      item.y = offset;
      lastNode[gen] = item.y;

      if (item.partners) {
        for (let i = 0; i < item.partners.length; i++) {
          item.partners[i].y += diff;

          if (item.partners[i].y > lastNode[gen]) {
            lastNode[gen] = item.partners[i].y;
          }
        }
      }
    }

    if (item.partners) {
      for (let i = 0; i < item.partners.length; i++) {
        this.recalculateGroups(item.partners[i], gen, item);
      }
    }

    if (item.children && item.children.length && (!partner || ENABLE_PARTNER_BRANCH)) {
      for (let i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        this.recalculateGroups(child, gen+1);
      }
    }
  }

  generateLines(item, gen, partner, reverseIndex) {
    const SPACE = 260;
    const WIDTH = 1200;
    const HEIGHT = 1200;
    const C = [WIDTH/2, HEIGHT/2];

    const parents = this.getParentCoordinates(item);

    const OFFSET_Y = 0;// C[1];// - genIndex[gen]/2;
    const OFFSET_P = 0;//C[1];// - genIndex[gen-1]/2;

    let start = {};

    let x = item.x;
    let y = item.y + OFFSET_Y;
    // let y0 = item.y;

    if (partner) {
      start = {x:partner.x, y:partner.y + OFFSET_Y};
    }
    else {
      if (gen < (SHOW_ORIGIN ? 1 : 2)) {
        start = {x:0, y:y};
      }
      else {
        if (SHOW_ORIGIN && gen === 1) {
          start.x = item.parent.partners[0].x;
          start.y = C[1]-15;
        }
        else {
          start.x = parents.x;
          start.y = parents.y + OFFSET_P;
        }
      }
    }

    const LINE_OFFSET = 4;

    let x1 = start.x + SPACE*0.6;
    let y1 = start.y;
    let x2 = x;
    let y2 = y;

    let isEx = partner && item.EX_PARTNERS.length > 0;
    let isBloodline = false;
    let pr = partner ? partner : item;

    while (pr && !isBloodline) {
      if (pr.id === 'START') {
        isBloodline = true;
        break;
      }
      else {
        pr = pr.parent;
      }
    }

    const LO = LINE_OFFSET;
    const gIndex = (SHOW_ORIGIN ? 0 : 1);
    let yOffset = (gen === 0 || gen === 1) ? 0 : item.childIndex*LO;

    if (gen > gIndex && !partner && item.parent && item.parent.children.length) {
      yOffset -= (item.parent.children.length/2)*LO;
    }

    let pts = [{x: start.x, y: start.y + yOffset}]
    // ctx.moveTo(start.x, start.y);
    if (gen > gIndex && !partner) {
      const nx = this.checkLineOverlap(x1, y1 + yOffset, y2, gen, LO, item);

      pts.push({x:nx, y:y1 + yOffset})
      pts.push({x:nx, y:y2})
    }

    pts.push({x:x2, y:y2})

    lineQueue.push({pts: pts, gen: gen, ex: isEx, bloodline: isBloodline});
    textQueue.push({item:item, x:x, y:y});

    if (item.partners) {
      for (let i = 0; i < item.partners.length; i++) {
        this.generateLines(item.partners[i], gen, item, i);
      }
    }

    if (item.children && item.children.length && (!partner || ENABLE_PARTNER_BRANCH)) {
      for (let i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        this.generateLines(child, gen+1);
      }
    }
  }

  getParentCoordinates(item) {
    let pr = item.parent ? item.parent : null;
    let pt = null;
    if (item.parent && item.parent.partners) {
      for (let p of item.parent.partners) {
        if (p.id === item.FATHER || p.id === item.MOTHER) {
          pt = p;
        }
      }
    }

    if (!pr) {
      return null;
    }
    else if (pt) {
      let y = (pr.y + pt.y)/2;
      return {x:pr.x, y:y};
    }
    else {
      return {x:pr.x, y:pr.y};
    }
  }

  checkLineOverlap(x, y, y2, gen, r, item) {
    let match = true;
    let limit = 200;

    while (match && limit > 0) {
      match = false;
      for (let i = 0; i < lineNodes.length; i++) {

        const p = lineNodes[i];
        if (gen === p.gen && (x > p.x - r && x < p.x + r) && ((y > p.y && y < p.y2) || (y < p.y && y > p.y2))) {
          x = p.x - r;
          match = true;
          // console.log(item.NAME, x, p.x, 1)
          break;
        }
        else if (gen === p.gen && (x > p.x - r && x < p.x + r) && ((y2 > p.y && y < p.y2) || (y2 < p.y && y > p.y2))) {
          const dir = y < p.y && y2 < y ? -1 : 1;
          x = p.x + r*dir;
          match = true;
          // console.log(item.NAME, x, p.x, 2)
          break;
        }
        else if (gen === p.gen && x >= p.x && ((y > p.y && y < p.y2) || (y < p.y && y > p.y2))) {
          x = p.x - r;
          match = true;
          // console.log(item.NAME, x, p.x, 3)
          break;
        }
      }
      limit--;
    }

    if (limit < 1) {
      console.log('limitter', item.NAME);
    }

    lineNodes.push({x:x, y: y, y2:y2, gen: gen});
    return x;
  }
}

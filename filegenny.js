const frame_id = [];
const vehicle_id = [];
const x_pos = [];
const y_pos = [];
const heading = [];
const left_pos = [];
const length = [];
const width = [];
const distinct = [];
const tracked_vehicles = [];
const tracked_vehicles_int = [];
const colors = [];
const colorTag = [];
let parsed_data = [];
const tracked_frames = [];
const numFrames = [];
let dur1;
let dur2;

//dataFile = 'test.csv';
//dataFile = './dataToProcess/metadata_simple/A2_0_simple_lmap_data.csv';
//dataFile = './A2_0_simple_lmap_data.csv'

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//!             Select File to convert to preprocessed format
//dataFile = './A2_0_simple_lmap_data.csv';
dataFile = './dataToProcess/metadata_simple/D0_0_simple_lmap_data.csv'
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//!             Set File name for new file here:
//!           * add file extension to file name *
//*   example of valid file name usage: let processedFileName = 'A2_0_simple_lmap_json.json';
let processedFileName = 'D0_0_simple_lmap_json.json';
//! Make sure the following heading is included into each file; or modify the code to run without the heading
//*    required heading-->     frame_id,vehicle_id,x_pos,y_pos,heading,left_pos,length,width
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


async function getData() {
    // This function turns the data into a parsed csv format to easy distinct vehicle detection
    
    const start1 = performance.now();

    //TODO: DATA
    //! uncomment to match above selection of data
    //const response = await fetch('A2_0_simple_lmap_data.csv');
    const response = await fetch(dataFile);
    
    
    const tabledata = await response.text();
    let count = 0;

    // manual parser
    const table = tabledata.split('\n');

    table.forEach(row => {   
        const column = row.split(',');
        const frame = column[0];
        frame_id.push(frame);
        const vehicle = column[1];
        vehicle_id.push(vehicle);
        const x = column[2];
        x_pos.push(x);
        const y = column[3];
        y_pos.push(y);
        const head = column[4];
        heading.push(head);
        const left = column[5];
        left_pos.push(left);
        const len = column[6];
        length.push(len);
        const wdth = column[7];
        width.push(wdth);
    });

    //! Finding the all disctinct values column
    distinct.push(... new Set(vehicle_id));
    distinct.shift(); // correction for named column not needed if lables are removed
    console.log('Number of distinct values detected:', distinct.length);
    //console.log(distinct);
    //console.log(x_pos);
    dur1 = performance.now() - start1;

    vehicleObjectDrawing();
}


async function papa(){
    let newNew = [];
    
    //TODO: DATA
    const response = await fetch(dataFile);
    //const response = await fetch('A2_0_simple_lmap_data.csv');
    const data = await response.text();
    
    const parsed = Papa.parse(data, {
        header: true,
        complete: function (results) {
            //!console.log('and the result is',results.data);
            //results.data.map((data, index) => {
                //console.log(data);
                //vehicle_identifier(data);
            //});
            //parsed_data.push(results.data);
            newNew = results.data;
        }
    });
    parsed_data.push(newNew);
    //console.log('newnew', newNew);
    
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function hsvToRgb(h, s, v) {
    var r, g, b;
    
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
  
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }
    r *= 255; g *= 255; b *= 255;
    //return [ r * 255, g * 255, b * 255 ];
    return `rgb(${r},${g},${b})`;
    //return `rgb(${random(0, 255) * ID},${random(0, 255) * ID},${random(0, 255) * ID})`;

  }

async function vehicleObjectDrawing() {
    

    const start2 = performance.now();
    
    await papa();
    frame_id.shift();
    vehicle_id.shift();
    x_pos.shift();
    y_pos.shift();
    heading.shift();
    left_pos.shift();
    length.shift();
    width.shift();
 


    //console.log('postions', x_pos[0], y_pos[0]);
    for ( i in distinct) {
        let id = distinct[i];
        id = parseInt(id);
        let hue = ((4 * id) % 19 / 19);
        let vehicle_color = hsvToRgb(hue,1,1, id);
        colors.push(vehicle_color);
        console.log('vehicle color',vehicle_color);

    }

    const frameOfFrames = [];
    numFrames.push(... new Set(frame_id));
    console.log('Number of distinct frames detected:', numFrames.length);
    //!console.log(numFrames);
    let frameNum = 0;

    parsed_data = Object.values(parsed_data);
    parsed_data = parsed_data[0];
    let frame1 = parsed_data.filter(frame1 => frame1.frame_id === '8.00');
    //console.log('vehicle1:::::::::: ',frame1);

    //! working frame clustering algorithm -----------------------------

    numFrames.forEach(frame => {
        let frame_filtered = parsed_data.filter(this_frame => this_frame.frame_id === frame);
        //console.log('this_frame', frame_filtered);
        //console.log('Loading frame: ', frame);
        frameOfFrames.splice(frame,0,frame_filtered);
    });
    //! ----------------------------------------------------------------

    let FRAME_PERIOD = 30;
    let lastTime = 0;



//! working animation =================================================================
//TODO: fix disctinct color generation --- colors appear to change once a vehicle leaves the field of view
//TODO: data appears to potentially need some smoothing, perhaps averaging vehicle dimensions

    //* background image


    console.log('num of rows', frame_id.length);

    //! File downloader
    function downloadDatafile(data, name) {
        const a = document.createElement("a");
        const type = name.split(".").pop();
        a.href = URL.createObjectURL( new Blob([ data ]),  { type:`text/${type === "txt" ? "plain" : type}` } );
        a.download = name;
        a.click();
    }

    downloadDatafile(JSON.stringify(frameOfFrames), processedFileName);


    console.log('done generating file');

}



class Detected_Vehicle {

    constructor(frame_id, vehicle_id, x_pos, y_pos, headingX, headingY, length, width, color) {
       this.frame_id = frame_id;
       this.vehicle_id = vehicle_id;
       this.x_pos = x_pos;
       this.y_pos = y_pos;
       this.hx = headingX;
       this.hy = headingY;
       //this.leftX = leftX;
       //this.leftY = leftY;
       this.length = length;
       this.width = width;
       this.color = color;
       //this.nextFrame = nextFrame;
    } 
  
    drawVehicle() {
       
      // all passed args are elements of index i of arrays hold their respective values, to be iterarted upon creating distinct objects per iteration.
       
      //*console.log('THIS hx', this.hx);
       ctx.beginPath();
       ctx.fillStyle = this.color;
       //ctx.scale(.2, .2);
       this.frame_id = parseFloat(this.frame_id);
       this.vehicle_id = parseFloat(this.vehicle_id);
       this.x_pos = parseFloat(this.x_pos);
       this.y_pos = parseFloat(this.y_pos);
       this.hx =  parseFloat(this.hx);
       this.hy = parseFloat(this.hy);
       this.length = parseFloat(this.length);
       this.width = parseFloat(this.width);
       this.lx = (-this.hy);
       this.ly = (this.hx);

        //*console.log('lx and ly\n', this.lx, this.ly); //! lx is working

       // normalize vector positions
       let hr = Math.sqrt(this.hx*this.hx + this.hy*this.hy);
       let lr = Math.sqrt(this.lx*this.lx + this.ly*this.ly);
       let normH = [(this.hx/hr),(this.hy/lr)];
       let normL = [(this.lx/lr),(this.ly/lr)];    // access via normL[0] etc...
  
       // Frontal left corner position
       // based upon: (xa, xb) = (this.x_pos, this.y_pos) + this.length * (normH[0], normH[1]) / 2 + this.width * (normL[0], normL[1]) / 2;
       
       // Corner position a
       let ax = (this.x_pos) + (this.length * normH[0]) / 2 + ((this.width * normL[0])/2);
       let ay = (this.y_pos) + (this.length * normH[1]) / 2 + ((this.width * normL[1])/2);
       //console.log(typeof ax);
       // Corner position b
       let bx = (this.x_pos) + (this.length * normH[0]) / 2 - ((this.width * normL[0])/2);
       let by = (this.y_pos) + (this.length * normH[1]) / 2 - ((this.width * normL[1])/2);
       //console.log(typeof bx);
       //bx = parseFloat(bx.toFixed(2));
       //console.log(bx);
       // Corner position c
       let cx = (this.x_pos) - (this.length * normH[0]) / 2 + ((this.width * normL[0])/2);
       let cy = (this.y_pos) - (this.length * normH[1]) / 2 + ((this.width * normL[1])/2);
       // Corner position d
       let dx = (this.x_pos) - (this.length * normH[0]) / 2 - ((this.width * normL[0])/2);
       let dy = (this.y_pos) - (this.length * normH[1]) / 2 - ((this.width * normL[1])/2);

        //*console.log('ax value: ' + ax);
       ctx.beginPath();       // start new path 

       ctx.moveTo(ax, ay);    // move the pen to ax, ay
       ctx.lineTo(bx, by);    // draw line from ax, ay to bx, by
       
       ctx.moveTo(bx, by);
       ctx.lineTo(dx, dy);

       ctx.moveTo(cx, cy);
       ctx.lineTo(ax, ay);

       ctx.moveTo(dx, dy);
       ctx.lineTo(cx, cy);

       ctx.lineWidth = 5;
       ctx.strokeStyle = this.color;
       ctx.stroke();          // render the bounding box

    }
    
  }  

getData();
//console.log('parsed data arr', parsed_data);



const frameRate = 60;

class Utility {
    static Cd = 0.47;    //drag coefficient of a sphere is approximately 0.47
    static rho = 1.225;   //the density of air is 1.225 kg/m^3
    static A = Math.PI*Math.pow(0.05, 2)    //Cross-sectional area of 10 cm diameter sphere
    static g = 10;      //gravity   10m/s
    static m = 1;      //mass  1kg

    static calNextPosition(enviroment, projectiles) {
        const interval = 1/frameRate;
        let x = projectiles.x;
        let y = projectiles.y;
        let v_x = projectiles.v_x;
        let v_y = projectiles.v_y;
        const v_wind = enviroment.windDirection * enviroment.windMagnitude;

        let drag_x = 0.5*this.rho*this.A*this.Cd*Math.pow(v_x - v_wind ,2);
        drag_x = v_x - v_wind > 0 ? -drag_x:drag_x;

        let drag_y = 0.5*this.rho*this.A*this.Cd*Math.pow(v_y,2);
        drag_y = v_y > 0 ? -drag_y:drag_y;
        const a_x = drag_x/this.m; 
        const a_y = (this.m*this.g + drag_y)/this.m; 
        v_x += a_x*interval;
        v_y += a_y*interval;
        const dx = v_x*interval;
        const dy = v_y*interval;
        x += dx;
        y += dy;
        projectiles.v_x = v_x;
        projectiles.v_y = v_y;
        projectiles.x = x;
        projectiles.y = y;
    }

    static euclideanDis(p1,p2){
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y,2)); 
    }
  
  }


module.exports = {frameRate, Utility};
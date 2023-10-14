var scene = null;
var maxDepth = 1;
var background_color = [190/255, 210/255, 215/255];
var ambientToggle = true;
var diffuseToggle = true;
var specularToggle = true;
var reflectionToggle = true;
var bias = 0.001;

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction;
    }
}

class Intersection {
    constructor(distance, point) {
        this.distance = distance;
        this.point = point;
    }
}

class Hit {
    constructor(intersection, object) {
        this.intersection = intersection;
        this.object = object;
    }
}

/*
    Intersect objects
*/
function raySphereIntersection(ray, sphere) { // TODO*
    var center = sphere.center;
    var radius = sphere.radius;

    // Compute intersection
    var d = normalize(ray.direction); // slide 13
    var e = ray.origin;
    var A = dot(d, d);
    var B = 2 * dot(d, sub(e, center));
    var C = dot(sub(e, center), sub(e, center)) - (radius * radius);

    // If there is a intersection, return a new Intersection object with the distance and intersection point:
    // E.g., return new Intersection(t, point);
    var discriminant = (B * B) - (4 * A * C) // slide 18: B^2 - 4AC

    if (discriminant >= 0) {
        var t = (-B - Math.sqrt(discriminant)) / (2 * A);

        if (t > 0)
            return new Intersection(t, add(ray.origin, mult(ray.direction, t - bias)));
    }

    // If no intersection, return null
    return null;
}

function rayPlaneIntersection(ray, plane) { // TODO*

    // Compute intersection
    var n = normalize(plane.normal);
    var d = ray.direction;
    var intersection = dot(n, d);

    // If there is a intersection, return a dictionary with the distance and intersection point:
    // E.g., return new Intersection(t, point);
    var dir = sub(plane.center, ray.origin);
    var t = (dot(dir, plane.normal)) / intersection;

    if (t > 0)
        return new Intersection(t, add(ray.origin, mult(d, t - bias)));

    // If no intersection, return null
    return null;
}

function intersectObjects(ray, depth) { // TODO*
    // var n = normalize(plane.normal);
    // var d = ray.direction;
    var hitting = null;
    var distance = Infinity;

    // Loop through all objects, compute their intersection (based on object type and calling the previous two functions)
    // Return a new Hit object, with the closest intersection and closest object
    for (var i = 0; i < scene.objects.length; i++) {
        var object = scene.objects[i];
        var intersect = null;

        if (object.type == "sphere")
            intersect = raySphereIntersection(ray, object);
        else if (object.type == "plane")
            intersect = rayPlaneIntersection(ray, object);
        
        if (intersect != null) {
            var d = intersect['distance'];

            if (d < distance) {
                hitting = new Hit(intersect, object);
                distance = d;
            }
        }
        
        // return new Hit(dist - depth, object);
    }

    return hitting;
    // If no hit, return null
    //return null;
}

function sphereNormal(sphere, pos) { // TODO
    // Return sphere normal
    return normalize(sub(pos, sphere.center));
}

/*
    Shade surface
*/
function shade(ray, hit, depth) { // TODO

    var object = hit.object;
    var color = [0, 0, 0];
    
    
    // Compute object normal, based on object type
    // If sphere, use sphereNormal, if not then it's a plane, use object normal
    var normal;

    if (object.type == "sphere")
        normal = sphereNormal(object, hit.intersection.point);
    else if (object.type == "plane")
        normal = normalize(object.normal);

    // Loop through all lights, computing diffuse and specular components *if not in shadow*
    var diffuse = 0;
    var specular = 0;

    for (var i = 0; i < scene.lights.length; i++) {
        var light = scene.lights[i];
        if (isInShadow(hit, light) == false) {
            var l = normalize(sub(light.position, hit.intersection.point));
            var h = normalize(add(l, mult(ray.direction, -1)));
            diffuse += Math.max(0, dot(l, normal));
            specular += Math.pow(Math.max(0, dot(normal, h)), object.specularExponent);
        }
    }

    // Combine colors, taking into account object constants
    if(specularToggle)
        color = add(color,mult([255,255,255], object.specularK*specular));
    if(ambientToggle)
        color = add(color,mult(object.color, object.ambientK));
    if(diffuseToggle)
        color = add(color,mult(object.color, object.diffuseK*diffuse));

    // Handle reflection, make sure to call trace incrementing depth
    
    var reflectedColor = [0, 0, 0];

    if (reflectionToggle) {
        var reflectedRay = new Ray(hit.intersection.point, reflect(mult(ray.direction, -1), normal));
        reflectedColor = trace(reflectedRay, depth + 1);
        if (reflectedColor != null)
                color = add(color, mult(reflectedColor, object.reflectiveK));
    }

    return color;
}


/*
    Trace ray
*/
function trace(ray, depth) {
    if(depth > maxDepth) return background_color;
    var hit = intersectObjects(ray, depth);
    if(hit != null) {
        var color = shade(ray, hit, depth);
        return color;
    }
    return null;
}

function isInShadow(hit, light) { // TODO

    // Check if there is an intersection between the hit.intersection.point point and the light
    // If so, return true
    // If not, return false
    var ray = new Ray(hit.intersection.point, normalize(sub(light.position, hit.intersection.point)));
    var hit2 = intersectObjects(ray, 0);

    if (hit2 != null) {
        if (hit2.intersection.distance > 0)
            return true;
    }
    return false;
}

/*
    Render loop
*/
function render(element) {
    if(scene == null)
        return;
    
    var width = element.clientWidth;
    var height = element.clientHeight;
    element.width = width;
    element.height = height;
    scene.camera.width = width;
    scene.camera.height = height;

    var ctx = element.getContext("2d");
    var data = ctx.getImageData(0, 0, width, height);

    var eye = normalize(sub(scene.camera.direction,scene.camera.position));
    var right = normalize(cross(eye, [0,1,0]));
    var up = normalize(cross(right, eye));
    var fov = ((scene.camera.fov / 2.0) * Math.PI / 180.0);

    var halfWidth = Math.tan(fov);
    var halfHeight = (scene.camera.height / scene.camera.width) * halfWidth;
    var pixelWidth = (halfWidth * 2) / (scene.camera.width - 1);
    var pixelHeight = (halfHeight * 2) / (scene.camera.height - 1);

    for(var x=0; x < width; x++) {
        for(var y=0; y < height; y++) {
            var vx = mult(right, x*pixelWidth - halfWidth);
            var vy = mult(up, y*pixelHeight - halfHeight);
            var direction = normalize(add(add(eye,vx),vy));
            var origin = scene.camera.position;

            var ray = new Ray(origin, direction);
            var color = trace(ray, 0);
            if(color != null) {
                var index = x * 4 + y * width * 4;
                data.data[index + 0] = color[0];
                data.data[index + 1] = color[1];
                data.data[index + 2] = color[2];
                data.data[index + 3] = 255;
            }
        }
    }
    console.log("done");
    ctx.putImageData(data, 0, 0);
}

/*
    Handlers
*/
window.handleFile = function(e) {
    var reader = new FileReader();
    reader.onload = function(evt) {
        var parsed = JSON.parse(evt.target.result);
        scene = parsed;
    }
    reader.readAsText(e.files[0]);
}

window.updateMaxDepth = function() {
    maxDepth = document.querySelector("#maxDepth").value;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleAmbient = function() {
    ambientToggle = document.querySelector("#ambient").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleDiffuse = function() {
    diffuseToggle = document.querySelector("#diffuse").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleSpecular = function() {
    specularToggle = document.querySelector("#specular").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

window.toggleReflection = function() {
    reflectionToggle = document.querySelector("#reflection").checked;
    var element = document.querySelector("#canvas");
    render(element);
}

/*
    Render scene
*/
window.renderScene = function(e) {
    var element = document.querySelector("#canvas");
    render(element);
}
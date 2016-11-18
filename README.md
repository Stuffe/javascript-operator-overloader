# javascript-operator-overloader
This 

	<script type="text/javascript" src="/static/lib/operator-overloader.js"></script>
	<script>
		// Lets define an object that handles coordinate points.
		// Our object MUST be able to be initiated with the first argument alone.
		// pass arrays or objects if you need more
		function point(value){
			
      // This function must be called with the first argument
      // It will return false if the this is just a normal new object call.
			var res = overload_new_value(this, value);
			if(res === false){
				this.value = value;
			}else{
        // If it doesn't return false, we have caught the result of a calculation and an object of the same type as this with the resulting state has been returned.
        // We copy the important state variables into this instance.
				this.value = res.value;
			}
			
      // ValueOf is responsible for returning the magic numbers to the JavaScript engine, which in turn allows us to deduce what operations were done on our objects.
      // The three lines below should just be copy pasted as is.
			this.valueOf = function(){
				return overload_valueOf(this);
			}
			
      // This is completely optional but left in this minimal example so we can log the value of our point objects below.
			this.toString = function(){
				return "("+this.value[0]+", "+this.value[1]+")";
			}
		}
    
    // The following four static functions are needed in order to compute +, -, * and / 
		// The names of these functions are hardcoded in the project and should not be changed.

    // Addition
    point.opp_add = function(obj1, obj2){
			return [obj1.value[0] + obj2.value[0], obj1.value[1] + obj2.value[1]];
		}
		
    // Subtraction
		point.opp_sub = function(obj1, obj2){
			return [obj1.value[0] - obj2.value[0], obj1.value[1] - obj2.value[1]];
		}
		
    // Multiplication
		point.opp_mul = function(obj1, obj2){
			return [obj1.value[0] * obj2.value[0], obj1.value[1] * obj2.value[1]];
		}
		
    // Division
		point.opp_div = function(obj1, obj2){
			return [obj1.value[0] / obj2.value[0], obj1.value[1] / obj2.value[1]];
		}
		
    // That's it, we are now ready for an example.
		var p1 = new point([1, 2]);
		var p2 = new point([3, 4]);
	  
    // Notice we have to "catch" the calculation results inside a new point object.
		console.log("Addition: ", p1.toString() + " + " + p2.toString() + " = " + new point(p1 + p2).toString());
    
    // There is a fifth optional static function used only for supporting negative first terms.
		point.opp_inv = function(obj1){
			return [-obj1.value[0], -obj1.value[1]];
		}
		
    console.log("Inversion: ", new point(-p1).toString());
    
    // Let's put it all together.
		var p3 = new point([8, 4]);
		var p4 = new point([3, 7]);
		var p5 = new point([2, 3]);
		var p6 = new point([6, 14]);

    console.log("'Pure crazyness': ", new point(-p1 + p2 * p3 - p4 / p5 / p6).toString());
    </script>

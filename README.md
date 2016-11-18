# javascript-operator-overloader

# Caveats
JavaScript does not support operator overloading out of the box. This is an attempt to solve that problem, but there are certain pitfalls you should be aware of before considering this:
 - Calculation results must be passed to a new object, so instead of (p1 + p2 + p3) you have to do new point(p1 + p2 + p3), (given your user defined object is named "point").
 - Only +, -, * and / are supported, the fifth arithmetic opperator % is not.
 - Coercion to strings (""+p1) and comparisons (p1 == p2) will not work as expected. New functions should be built for these purposes if needed, like (p1.val == p2.val).
 - Finally the computational resources needed to calculate the answer increases quadratically with the number of terms. Therefore only 6 terms is allowed in one calculation chain per default (althohug this can be increased). For longer calculation chains than that, split the calculations up, like: new point(new point(p1 + p2 + p3 + p4 + p5 + p6) + new point(p7 + p8 + p9 + p10 + p11 + p12))

# Technical explanation
When JavaScript applies arethmetic opperations on objects it actually applies it to the result of a call to object.valueOf(). We can pass the objects to a global variable when valueOf() is called, but we get no direct information about which operations where applied directly. 
This script works is by returning numbers from the valueOf() function in a way so that the operations can be deduced from the final result. This is why the final result of a calculation must be passed to a new instance of the given object type.

# Minimal example 
	<script type="text/javascript" src="/static/lib/operator-overloader.js"></script>
	<script>
		// Let's define an object that handles coordinate points.
		function point(x, y){
			// We can optionally change the maximum amount of terms allowed as such, 
			// but calculation chain length correlates to required CPU computation in an exponentially increasing fashion. 
			this.max_terms = 7;
			
			// Let's save our variables
			this.x = x;
			this.y = y;
			
			// A way to get the state of our object (optional of course).
			self.__defineGetter__( 'str', function(){ return "("+self.x+", "+self.y+")"; } );

			// ValueOf is responsible for returning the magic numbers to the JavaScript engine, 
			// which in turn allows us to deduce what operations were done on our objects.
			// The three lines below should just be copy pasted as is.
			this.valueOf = function(){
				return overload_valueOf(this);
			}
			
			// This functino should be called after all initialization has been done, so put it at the end. 
			// It checks if the value passed to this object was in fact the result of previous calculations and if so it overwrites the variables of this object with the result. 
			// It returns true if this is actually the result of calculations, or false otherwise. Very CPU intensive, 
			// so only call once.
			overload_new_value(this);
		}
    
		// The following four static functions are needed in order to compute +, -, * and /
		// They all take two object instances and return a new one. 
		// The names of these functions are hardcoded in the project and should not be changed.

		// Addition
		point.opp_add = function(obj1, obj2){
			return new point(obj1.x + obj2.x, obj1.y + obj2.y);
		}
		
		// Subtraction
		point.opp_sub = function(obj1, obj2){
			return new point(obj1.x - obj2.x, obj1.y - obj2.y);
		}
		
		// Multiplication
		point.opp_mul = function(obj1, obj2){
			return new point(obj1.x * obj2.x, obj1.y * obj2.y);
		}
		// Division
		point.opp_div = function(obj1, obj2){
			return new point(obj1.x / obj2.x, obj1.y / obj2.y);
		}
		
		// That's it, we are now ready for a computational example.
		var p1 = new point(1, 2);
		var p2 = new point(3, 4);
	  
		// Notice we have to "catch" the calculation results inside a new point object.
		console.log("Addition: ", p1.str + " + " + p2.str + " = " + new point(p1 + p2).str);
    
		// There is a fifth optional static function used only for supporting negative first terms.
		point.opp_inv = function(obj1){
			return new point(-obj1.x, -obj1.y);
		}
		
		console.log("Inversion: ", new point(-p1).str);
    
		// Let's put it all together.
		var p3 = new point(8, 4);
		var p4 = new point(3, 7);
		var p5 = new point(2, 3);
		var p6 = new point(6, 14);

		console.log("Inversion and chained crazyness: ", new point(-p1 + p2 * p3 - p4 / p5 / p6).str);
	</script>

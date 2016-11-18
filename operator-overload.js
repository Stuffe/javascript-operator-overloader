overload_calculation_objects = {}; // Long to avoid namespace collisions
overload_calculation_lines = {}; 

function overload_item_formula(debth){
	return parseFloat(Math.pow(1.5, debth)) + 0.1;
}

function overload_new_value (obj){
	var obj_name = obj.constructor.name;
	var value = obj.constructor.arguments[0]
	overload_calculation_objects[obj_name] = overload_calculation_objects[obj_name] || [];
	if(overload_calculation_objects[obj_name].length > 0){
		if(overload_calculation_objects[obj_name].length > (obj.max_terms || 6)){
			throw "Error: Too many operations ("+overload_calculation_objects[obj_name].length+"), cluster them with parenthesies or change this.max_terms in the "+obj_name+" object.";
		}
		var search_space = function (value){
			inputs = overload_calculation_objects[obj_name].length;
			if(inputs == 1 && value == overload_item_formula(1))
				return [0];
			if(inputs == 1 && value == -overload_item_formula(1))
				return [1];
			input = 1;
			partial_results = [[overload_item_formula(1), -overload_item_formula(1)]];
			partial_paths = [[[0], [1]]];
			while(input < inputs){
				partial_results.push(new Array(Math.pow(4, input) * 2));
				partial_paths.push(new Array(Math.pow(4, input) * 2));
				for (key in partial_results[input-1]){
					if(input+1 == inputs){
						if(eval(partial_results[input-1][key] +"+"+ overload_item_formula(input+1)) == value)
							return partial_paths[input-1][key].concat([0]);
						if(eval(partial_results[input-1][key] +"-"+ overload_item_formula(input+1)) == value)
							return partial_paths[input-1][key].concat([1]);
						if(eval(partial_results[input-1][key] +"*"+ overload_item_formula(input+1)) == value)
							return partial_paths[input-1][key].concat([2]);
						if(eval(partial_results[input-1][key] +"/"+ overload_item_formula(input+1)) == value)
							return partial_paths[input-1][key].concat([3]);
					}else{
						// Later speed improvements: concatinating strings triggers garbage collection
						// Also, two arrays shouldn't be needed
						partial_results[input].push(partial_results[input-1][key] +"+"+ overload_item_formula(input+1));
						partial_results[input].push(partial_results[input-1][key] +"-"+ overload_item_formula(input+1));
						partial_results[input].push(partial_results[input-1][key] +"*"+ overload_item_formula(input+1));
						partial_results[input].push(partial_results[input-1][key] +"/"+ overload_item_formula(input+1));
						partial_paths[input].push(partial_paths[input-1][key].concat([0]));
						partial_paths[input].push(partial_paths[input-1][key].concat([1]));
						partial_paths[input].push(partial_paths[input-1][key].concat([2]));
						partial_paths[input].push(partial_paths[input-1][key].concat([3]));
					}
				}
				input += 1;
			}
			return false;
		}

		var result = search_space(value);
		if(result){
			var stat_obj = window[obj_name];
			
			var overloads = overload_calculation_objects[obj_name];
			overload_calculation_objects[obj_name] = [];
			
			overloads[0] = (result[0] == 0 ?  overloads[0] : stat_obj.opp_inv(overloads[0]));
			// First multiply and divide
			var first_order_opps = ["opp_mul", "opp_div"]
			for (opp_key in first_order_opps){
				while(result.indexOf(parseInt(opp_key)+2) != -1){
					var key = result.indexOf(parseInt(opp_key)+2)-1;
					overloads[key] = stat_obj[first_order_opps[opp_key]](overloads[key], overloads[key+1]);
					result.splice(key+1, 1);
					overloads.splice(key+1, 1);
				}
			}

			// Finally add and subtract
			var i = 1;
			var res = overloads[0];
			var second_order_opps = ["opp_add", "opp_sub"]
			while(i < overloads.length){
				res = stat_obj[second_order_opps[result[i]]](res, overloads[i]);
				i += 1;
			}
			
			for(var k in res) obj[k]=res[k];
			
			return true;
		}else{
			throw "Couldn't identify overload operations.";
		}
		
	}else{
		return false;
	}
}

function overload_valueOf(obj){
	var obj_name = obj.constructor.name;
	var line = (new Error).stack.split("\n");
	line = line[line.length-1]
	line = line.substring(0, line.lastIndexOf(":"));
	if(overload_calculation_lines[obj_name] != line){
		overload_calculation_objects[obj_name] = [];
		overload_calculation_lines[obj_name] = line;
	}

	overload_calculation_objects[obj_name].push(obj);
	return overload_item_formula(overload_calculation_objects[obj_name].length);
}

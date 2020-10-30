function basedisplay(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
       
    var callbacks = [];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;
    self.OnSubStateAvailable = OnSubStateAvailable;
    self.OnSubStateUpdate = OnSubStateUpdate;

    var monitored_entities =  [];

    if ("entity" in parameters && parameters.entity != "")
    {
        // Make sure that we monitor the entity, not an attribute of it
        split_entity = parameters.entity.split(".")
        self.entity = split_entity[0] + "." + split_entity[1]
        if (split_entity.length > 2)
        {
            self.entity_attribute = split_entity[2]
        }
        // Check if the sub_entity should be created by monitoring an attribute of the entity
        if ("entity_to_sub_entity_attribute" in parameters && parameters.entity_to_sub_entity_attribute != "")
        {
            self.sub_entity = self.entity
            self.sub_entity_attribute = parameters.entity_to_sub_entity_attribute
        }
    }

    // Only set up the sub_entity if it was not created already with the entity + attribute
    if ("sub_entity" in parameters && parameters.sub_entity != "" && !("sub_entity" in self))
    {
        // Make sure that we monitor the sub_entity, not an attribute of it
        split_sub_entity = parameters.sub_entity.split(".")
        self.sub_entity = split_sub_entity[0] + "." + split_sub_entity[1]
        if (split_sub_entity.length > 2)
        {
            self.sub_entity_attribute = split_sub_entity[2]
        }
        // Check if the entity should be created by monitoring an attribute of the sub_entity
        if ("sub_entity_to_entity_attribute" in parameters && !("entity" in self))
        {
            self.entity = self.sub_entity
            self.entity_attribute = parameters.sub_entity_to_entity_attribute
        }
    }

    if ("entity" in self) 
    {
        monitored_entities.push({"entity": self.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate})
    }
    if ("sub_entity" in self) 
    {
        monitored_entities.push({"entity": self.sub_entity, "initial": self.OnSubStateAvailable, "update": self.OnSubStateUpdate})
    }

    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function OnSubStateAvailable(self, state)
    {
        set_sub_value(self, state)
    }

    function OnSubStateUpdate(self, state)
    {
        set_sub_value(self, state)
    }

    function set_value(self, state)
    {
        if ("entity_attribute" in self) {
            value = state.attributes[self.entity_attribute]
        }
        else
        {
                value = state.state
        }

        if (isNaN(value))
        {
            self.set_field(self, "value_style", self.parameters.css.text_style);
            self.set_field(self, "value", self.map_state(self, value))
        }
        else
        {
            self.set_field(self, "value_style", self.parameters.css.value_style);
            self.set_field(self, "value", self.format_number(self, value));
            self.set_field(self, "unit_style", self.parameters.css.unit_style);
            if ("units" in self.parameters)
            {
                self.set_field(self, "unit", self.parameters.units)
            }
            else
            {
                self.set_field(self, "unit", state.attributes["unit_of_measurement"])
            }
        }
    }

    function set_sub_value(self, state)
    {
        if ("sub_entity_attribute" in self && self.sub_entity_attribute != "")
        {
            value = state.attributes[self.sub_entity_attribute]
        }
        else
        {
                value = state.state
        }

        if ("sub_entity_map" in self.parameters)
        {
            self.set_field(self, "state_text", self.parameters.sub_entity_map[value])
        }
        else
        {
            self.set_field(self, "state_text", value)
        }
    }
}

function baserss(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;

    //
    // RSS Info is always in the admin namespace
    //
    self.parameters.namespace = "admin";
       
    var callbacks = [];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function set_value(self, state)
    {
        self.story = 0;
        clearTimeout(self.timer);
        show_next_story(self);
        self.timer = setInterval(show_next_story, self.parameters.interval * 1000, self);
    }

    function show_next_story(self)
    {
        var stories = self.entity_state[parameters.entity].state.feed.entries;
        self.set_field(self, "text", stories[self.story].title);
        if ("show_description" in self.parameters && self.parameters.show_description === 1)
        {
            if ("summary" in stories[self.story])
            {
                self.set_field(self, "description", stories[self.story].summary)
            }
            if ("description" in stories[self.story])
            {
                self.set_field(self, "description", stories[self.story].description)
            }
        }
        self.story = self.story + 1;
        if ((self.story >= stories.length) || ("recent" in parameters && self.story >= parameters.recent))
        {
            self.story = 0;
        }
    }
}
function baseclimate(widget_id, url, skin, parameters)
{

    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...

    self = this

    // Initialization

    self.widget_id = widget_id

    // Parameters may come in useful later on

    self.parameters = parameters

    self.OnRaiseLevelClick = OnRaiseLevelClick
    self.OnLowerLevelClick = OnLowerLevelClick

    var callbacks =
        [
            {"selector": '#' + widget_id + ' #level-up', "action": "click", "callback": self.OnRaiseLevelClick},
            {"selector": '#' + widget_id + ' #level-down', "action": "click", "callback": self.OnLowerLevelClick},
        ]

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate

    if ("entity" in parameters)
    {
        var monitored_entities =
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }

    if( "step" in parameters && ! isNaN(self.parameters.step))
    {
        self.step = parseFloat(parameters.step)
    }
    else
    {
        self.step = 1
    }

    // Finally, call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)

    // Function Definitions

    // The StateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {
        self.min = state.attributes.min_temp
        self.max = state.attributes.max_temp
        self.level = state.attributes.temperature
        if ("units" in self.parameters)
        {
            self.set_field(self, "units", self.parameters.units)
        }
        else
        {
            self.set_field(self, "units", state.attributes["unit_of_measurement"])
        }
        set_view(self, state)
    }

    function OnStateUpdate(self, state)
    {
        self.level = state.attributes.temperature
        set_view(self, state)
    }

	function OnRaiseLevelClick(self)
    {
        self.level = parseFloat(self.level) + self.step;
		if (self.level > self.max)
		{
			self.level = self.max
		}
		args = self.parameters.post_service
        args["temperature"] = self.level
		self.call_service(self, args)
    }

	function OnLowerLevelClick(self, args)
    {
        self.level = parseFloat(self.level) - self.step;
		if (self.level < self.min)
		{
			self.level = self.min
		}
		args = self.parameters.post_service;
        args["temperature"] = self.level;
		self.call_service(self, args)
    }

	function set_view(self, state)
    {
        self.set_field(self, "level", self.format_number(self, state.attributes.current_temperature));
        if ("temperature" in state.attributes && state.attributes.temperature != null)
        {
            self.set_field(self, "level2", self.format_number(self, state.attributes.temperature))
        }
        else
        {
            self.set_field(self, "level2", "auto")
        }
	}
}

function baseAdminTable(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
    
    
    // Define callbacks for on click events
    // They are defined as functions below and can be any name as long as the
    // 'self'variables match the callbacks array below
    // We need to add them into the object for later reference
   
    var callbacks = []

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    var monitored_entities = [];
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);  

    // start building the tables

    window[self.widget_id] = {}
    default_table_list = Default_table_list()
    window["table_value_types"] = Table_value_types()

    // Check if namespaces are set, else default to admin
    if (!("namespace_list" in self.parameters)){
        window[self.widget_id]["namespace_list"] = ["admin"];
    } else {
        window[self.widget_id]["namespace_list"] = self.parameters.namespaces;
    }

    // add defaults for every namespace
    window[self.widget_id]["namespace_list"].forEach(_namespace => {
        default_table_list[_namespace + "entities"] = Default_entity_table();
    });

    // Check if tables are set, else default to app_table
    if (!("tables" in self.parameters)){
        window[self.widget_id]["tables"] = {"app":{"title":"App"}};
        window[self.widget_id]["namespace_list"].forEach(_namespace => {
            window[self.widget_id]["tables"][_namespace + "entities"] = {"title": _namespace + "entities"};
        });
    } else {
        if ("entities" in self.parameters.tables){
            window[self.widget_id]["show_namespaces"] = true;
            window[self.widget_id]["tables"] = {}            
            for (let _table in self.parameters.tables){
                if (_table != "entities"){
                    window[self.widget_id]["tables"][_table] = self.parameters.tables[_table];
                }
                else
                {
                    window[self.widget_id]["namespace_list"].forEach(_namespace => {
                        window[self.widget_id]["tables"][_namespace + "entities"] = self.parameters.tables["entities"];
                    });
                }                        
            }
        }
        else
        {
            window[self.widget_id]["show_namespaces"] = false;            
            window[self.widget_id]["tables"] = self.parameters.tables
            window[self.widget_id]["namespace_list"].forEach(_namespace => {
                window[self.widget_id]["tables"][_namespace + "entities"] = {"title": _namespace + "entities"};
            });
        }        
    }


    // check if table columns are defined, else set the defaults and add id as field
    for (let _table in window[self.widget_id]["tables"]){
        counter = 1;
        if (!("columns" in window[self.widget_id]["tables"][_table])){
            window[self.widget_id]["tables"][_table]["columns"] = {"id":{"order":0}};
            default_table_list[_table].forEach(_column => {
                window[self.widget_id]["tables"][_table]["columns"][_column] = {"title": _column,"order":counter};
                counter = counter + 1
            });
        }
        else
        {
            window[self.widget_id]["tables"][_table]["columns"]["id"] = {"order":0};
            for (let _column in window[self.widget_id]["tables"][_table]["columns"]){
                if (!("order" in window[self.widget_id]["tables"][_table]["columns"][_column])){
                    window[self.widget_id]["tables"][_table]["columns"][_column]["order"] = counter;
                    counter = counter + 1;
                }
            }
        }
    }

    //console.log(window[self.widget_id])



    // create the HTML tables
    for (let _table in window[self.widget_id]["tables"]){
        if (_table.includes("callback")){
            _class = "callbacks";
        } else if (_table.includes("entities")){
            _class = "entities";
        } else
        {
            _class = _table;
        }
        th_style = "";
        table_style = ""
        if ("table_style" in window[widget_id]["tables"][_table]){
            table_style = window[widget_id]["tables"][_table]["table_style"];
        }
        if ("head_style" in window[widget_id]["tables"][_table]){
            th_style = window[widget_id]["tables"][_table]["head_style"];
        }
        _thead ='<span data-bind="attr:{style: container_style}" id="' + self.widget_id + _table + '_table_id"><table style="' + table_style + '" class="' + _class + '"><thead><tr>';
        _options = '<tr>';
        sorted_columns = [];
        _orderlist = {};
        for ( let _column in window[widget_id]["tables"][_table]["columns"]){
            _orderlist[window[widget_id]["tables"][_table]["columns"][_column]["order"].toString()] = _column
        }
        for (var i=0; i<Object.keys(_orderlist).length; i++){
            _column = _orderlist[i.toString()]
            if (_column == "args" || _column == "kwargs" || _column == "attributes"){
                _class = "tooltip " + _column;
            }
            else
            {
                _class = _column;
            }
            if (_column == "id"){
                _thead = _thead + '<th style="display:none;" class="sort" data-sort="' + _column + '">' + _column + '<i class="caret"></i></th>';
                _options = _options + '<td style="display:none;" class="' + _class + '"></td>';
            } else {
                _width = ""
                if ("width" in window[widget_id]["tables"][_table]["columns"][_column]){
                    _width = 'width="'+ window[widget_id]["tables"][_table]["columns"][_column]["width"] + '" ';
                }
                td_style = "";
                if ("style" in window[widget_id]["tables"][_table]["columns"][_column]){
                    td_style = window[widget_id]["tables"][_table]["columns"][_column]["style"];
                }
                td_name = _column;
                if ("title" in window[widget_id]["tables"][_table]["columns"][_column]){
                    td_name = window[widget_id]["tables"][_table]["columns"][_column]["title"];
                }
                _thead = _thead + '<th style="' + table_style + th_style + '" ' + _width + 'class="sort" data-sort="' + _column + '">' + td_name + '<i class="caret"></i></th>';
                _options = _options + '<td style="' + table_style + td_style + '"class="' + _class + '"></td>';
            }
        }
        _thead = _thead + '</tr></thead><tbody class="list"></tbody></table></span>';
        _options = _options + '<tr>';
        document.getElementById(self.widget_id).innerHTML = document.getElementById(self.widget_id).innerHTML + _thead;
        window[self.widget_id]["tables"][_table]["options"] = _options;
    } 

    dom_ready('ws',self.widget_id);
    
}


function create_tables(widget_id, entities)
{
    window[widget_id].ready = false;

    // Create the tables
    for (let _table in window[widget_id]["tables"]){ 
        if (!(_table.includes("entities"))){
            create_clear(_table, widget_id);
        }
    }

    // Iterate the namespaces for entities table

    jQuery.each(entities.state, function(namespace)
    {
        // now create the entities table
        if (window[widget_id]["namespace_list"].indexOf(namespace) >= 0){
            create_clear(namespace + "entities", widget_id);

            // if the option is set that we dont want to see it we hide the entitiestable
            if (!window[widget_id]["show_namespaces"]){
                document.getElementById(widget_id + namespace + "entities_table_id").style.visibility = "hidden"
            }
        }


        jQuery.each(entities.state[namespace], function(entity)
        {
            if (entities.state[namespace][entity] != null)
            {
                // if the entity is in the namespace we want to see we put it in the entities table
                if (window[widget_id]["namespace_list"].indexOf(namespace) >= 0){
                    if (device(entity) =="sensor"){
                        console.log(entity)
                    }
                    options = get_column_values(entities.state[namespace][entity], entity, namespace + "entities", widget_id);
                    window[widget_id]["tables"][namespace + "entities"]["values"].add(options);
                }

                if (namespace === "admin")
                {
                    // if the entity is in the namespace admin we put it in the chosen table
                    for (let _table in window[widget_id]["tables"]){
                        if (device(entity) == _table)
                        {
                            options = get_column_values(entities.state[namespace][entity], entity, _table, widget_id);
                            window[widget_id]["tables"][_table]["values"].add(options);
                        }
                    }
                }
            }
        });
        //console.log(widget_id + namespace + " completely run through")
    });
    
    //window[widget_id]["table_list"].forEach(_table => {
    //    if (window[widget_id]["table_list"].indexOf(_table) >= 0){
    //        window[widget_id][_table]["table"].sort('id');
    //    }
    //});

    for (let _table in window[widget_id]["tables"]){
        for ( let _column in window[widget_id]["tables"][_table]["columns"]){
            _orderlist[window[widget_id]["tables"][_table]["columns"][_column]["order"].toString()] = _column
        }
        for (var i=0; i<Object.keys(_orderlist).length; i++){
            _column = _orderlist[i.toString()]
           $(".tooltip." + _column).hover(open_tooltip, close_tooltip);
        }
    }

//    $(".tooltip.kwargs").hover(open_tooltip, close_tooltip);
//    $(".tooltip.attributes").hover(open_tooltip, close_tooltip);

    window[widget_id].ready = true;
    console.log(window[widget_id])
}

function update_admin(widget_id, data)
{

    if (window[widget_id].ready !== true)
    {
        return
    }

    // Process any updates

    var id;

    // Log Update

    //if (data.event_type === "__AD_LOG_EVENT")
    //{
    //    $("#" + data.data.log_type + "_div").prepend(data.data.formatted_message + "<br>")
    //}

    //console.log("STATE CHANGED ************************************************")
    //console.log(data)


    // Entity Update

    if (data.event_type === "state_changed")
    {
        namespace = data.namespace;
        entity = data.data.entity_id;

        if (window[widget_id]["namespace_list"].indexOf(namespace) < 0){
            return
        }
        if (!(device(entity) in window[widget_id]["tables"])){
            return
        }

        if (window[widget_id]["namespace_list"].indexOf(namespace) >= 0) {
            //console.log("changing " + widget_id + namespace + "." + entity) 
            options = get_column_values(data.data.new_state, entity, namespace + "entities", widget_id);
            item = window[widget_id]["tables"][namespace + "entities"]["values"].get("id", entity);
            item[0].values(options);
        }
        if (namespace === "admin")
        {
            for (let _table in window[widget_id]["tables"]){
                if (device(entity) == _table)
                {
                    options = get_column_values(data.data.new_state, entity, _table, widget_id);
                    //console.log(widget_id + _table + " table : " + entity)
                    //console.log(options)
                    item = window[widget_id]["tables"][_table]["values"].get("id", entity);
                    //console.log(item)
                    item[0].values(options);
                }
            }


            // Sensors

            //if (device(entity) === "sensor")
            //{
            //    $('#' + device(entity) + "_" + name(entity)).text(state)
            //}
        }
    }

    if (data.event_type === "__AD_ENTITY_ADDED")
    {
        namespace = data.namespace;
        entity = data.data.entity_id;

        // Add To Entities table
        if (window[widget_id]["namespace_list"].indexOf(namespace) >= 0)
        {
            options = get_column_values(data.data.state, entity, namespace + "entities", widget_id);
            window[widget_id]["tables"][namespace + "entities"]["values"].add(options);
            //window[widget_id]["tables"][namespace + "entities"]["values"].sort('id');
            //console.log("added " + widget_id + namespace + "." + entity) 
        }

        if (namespace === "admin")
        {
            for (let _table in window[widget_id]["tables"]){
                if (device(entity) === _table)
                {
                    options = get_column_values(data.data.state, entity, _table, widget_id);
                    //console.log(widget_id][_table][" table : " + name(entity))
                    window[widget_id]["tables"][_table]["values"].add(options);
                    //window[widget_id]["tables"][_table]["values"].sort('id')
                }
            }
        }
    }

    if (data.event_type === "__AD_ENTITY_REMOVED")
    {
        entity = data.data.entity_id;
        // Remove from entities
        if (window[widget_id]["namespace_list"].indexOf(namespace) >= 0){
            window[widget_id]["tables"][namespace + "entities"]["values"].remove("id", entity);
            //console.log("removed " + widget_id + namespace + "." + entity + " from " + namespace + "entities table")
        }
        if (namespace === "admin")
        {
            for (let _table in window[widget_id]["tables"]){
                if (device(entity) == _table)
                {
                    window[widget_id]["tables"][_table]["values"].remove("id", entity)
                }
            }
        }
    }
}


function baseslider(widget_id, url, skin, parameters)
{

    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...

    self = this

    // Initialization

    self.widget_id = widget_id

    // Parameters may come in useful later on

    self.parameters = parameters

    self.OnRaiseLevelClick = OnRaiseLevelClick
    self.OnLowerLevelClick = OnLowerLevelClick

    var callbacks =
        [
            {"selector": '#' + widget_id + ' #level-up', "action": "click", "callback": self.OnRaiseLevelClick},
            {"selector": '#' + widget_id + ' #level-down', "action": "click", "callback": self.OnLowerLevelClick},
        ]

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate

    if ("entity" in parameters)
    {
        var monitored_entities =
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }

    // Finally, call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)

    // Function Definitions

    // The StateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {
        self.min = state.attributes.min
        self.max = state.attributes.max
        self.step = state.attributes.step
        self.level = state.state
        if ("units" in self.parameters)
        {
            self.set_field(self, "unit", self.parameters.units)
        }
        set_view(self, state)
    }

    function OnStateUpdate(self, state)
    {
        self.level = state.state
        set_view(self, state)
    }

	function OnRaiseLevelClick(self)
    {
        self.level = parseFloat(self.level) + self.step;
		if (self.level > self.max)
		{
			self.level = self.max
		}
		args = self.parameters.post_service
        args["value"] = self.level
		self.call_service(self, args)
    }

	function OnLowerLevelClick(self, args)
    {
        self.level = parseFloat(self.level) - self.step;
		if (self.level < self.min)
		{
			self.level = self.min
		}
		args = self.parameters.post_service
        args["value"] = self.level
		self.call_service(self, args)
    }

	function set_view(self, state)
    {
        self.set_field(self, "level", self.format_number(self, state.state))
	}
}
function basealarm(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id

    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    self.OnButtonClick = OnButtonClick
    self.OnCloseClick = OnCloseClick
    self.OnDigitClick = OnDigitClick
    self.OnArmHomeClick = OnArmHomeClick
    self.OnArmAwayClick = OnArmAwayClick
    self.OnDisarmClick = OnDisarmClick
    self.OnTriggerClick = OnTriggerClick
    
    
    var callbacks =
        [
            {"selector": '#' + widget_id + ' > span', "action": "click", "callback": self.OnButtonClick},
            {"selector": '#' + widget_id + ' #close', "action": "click", "callback": self.OnCloseClick},
            {"selector": '#' + widget_id + ' #0', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "0"}},
            {"selector": '#' + widget_id + ' #1', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "1"}},
            {"selector": '#' + widget_id + ' #2', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "2"}},
            {"selector": '#' + widget_id + ' #3', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "3"}},
            {"selector": '#' + widget_id + ' #4', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "4"}},
            {"selector": '#' + widget_id + ' #5', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "5"}},
            {"selector": '#' + widget_id + ' #6', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "6"}},
            {"selector": '#' + widget_id + ' #7', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "7"}},
            {"selector": '#' + widget_id + ' #8', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "8"}},
            {"selector": '#' + widget_id + ' #9', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "9"}},
            {"selector": '#' + widget_id + ' #BS', "action": "click", "callback": self.OnDigitClick, "parameters": {"digit" : "BS"}},
            {"selector": '#' + widget_id + ' #AH', "action": "click", "callback": self.OnArmHomeClick},
            {"selector": '#' + widget_id + ' #AA', "action": "click", "callback": self.OnArmAwayClick},
            {"selector": '#' + widget_id + ' #DA', "action": "click", "callback": self.OnDisarmClick},
            {"selector": '#' + widget_id + ' #TR', "action": "click", "callback": self.OnTriggerClick},
                
        ]
 
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    self.set_view = set_view
    
    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        self.set_field(self, "state", self.map_state(self, state.state))
    }
 
    function OnStateUpdate(self, state)
    {
        self.set_field(self, "state", self.map_state(self, state.state))
    }  

    function OnButtonClick(self)
    {
        self.code = self.parameters.initial_string
        self.set_view(self)

        $('#' + widget_id + ' > #Dialog').removeClass("modalDialogClose")
        $('#' + widget_id + ' > #Dialog').addClass("modalDialogOpen")
    }

    function OnCloseClick(self)
    {
        $('#' + widget_id + ' > #Dialog').removeClass("modalDialogOpen")
        $('#' + widget_id + ' > #Dialog').addClass("modalDialogClose")
    }

    function OnDigitClick(self, parameters)
    {
        if (parameters.digit == "BS")
        {
            if (self.code != self.parameters.initial_string)
            {
                if (self.code.length == 1)
                {
                    self.code = self.parameters.initial_string
                }
                else
                {
                    self.code = self.code.substring(0, self.code.length - 1);
                }
            }
        }
        else
        {
            if (self.code == self.parameters.initial_string)
            {
                self.code = parameters.digit
            }
            else
            {
                self.code = self.code + parameters.digit
            }
        }
        self.set_view(self)
    }
    
    function OnArmHomeClick(self)
    {
        
        args = self.parameters.post_service_ah
        args["code"] = self.code
        self.call_service(self, args)
        
        self.code = self.parameters.initial_string
        self.set_view(self)
    }
    
    function OnArmAwayClick(self)
    {
        args = self.parameters.post_service_aa
        args["code"] = self.code
        self.call_service(self, args)
        
        self.code = self.parameters.initial_string
        self.set_view(self)
    }
    
    function OnDisarmClick(self)
    {
        args = self.parameters.post_service_da
        args["code"] = self.code
        self.call_service(self, args)
        
        self.code = self.parameters.initial_string
        self.set_view(self)
    }
    
    function OnTriggerClick(self)
    {
        args = self.parameters.post_service_tr
        args["code"] = self.code
        self.call_service(self, args)

        self.code = self.parameters.initial_string        
        self.set_view(self)
    }
    
    function set_view(self)
    {
        self.set_field(self, "code", self.code)
    }
}
function basedatetime(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
    
    self.OnChange = OnChange;

    var callbacks = [
        {"observable": "DateValue", "action": "change", "callback": self.OnChange},
        {"observable": "TimeValue", "action": "change", "callback": self.OnChange},
    ];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }

    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnChange(self, state)
    {
        date = self.ViewModel.DateValue()
        time = self.ViewModel.TimeValue()
        args = self.parameters.post_service
        if (self.has_date && self.has_time) {
            args["datetime"] = self.state
            datetime = new Date(self.state);
            args["date"] = date;
            args["time"] = time;
        }
        else if (self.has_date) {
            args["date"] = date;
        }
        else {
            args["time"] = time;
        }
        self.call_service(self, args);
    }

    function OnStateAvailable(self, state)
    {   
        self.has_date = state.attributes.has_date
        self.has_time = state.attributes.has_time
        fields = document.getElementById(self.widget_id).childNodes[2];
        datefield = document.getElementById(self.widget_id).childNodes[2].childNodes[0];
        timefield = document.getElementById(self.widget_id).childNodes[2].childNodes[1];
        if(self.has_date && self.has_time)
        {
            // do nothing
        }
        else if(self.has_time)
        {
            fields.removeChild(datefield)
        }
        else if(self.has_date)
        {
            fields.removeChild(timefield)
        }
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }


    function set_value(self, state)
    {
        datetime = new Date(state.state);
        if (self.has_date && self.has_time) 
        {
            datevalue = datetime.getFullYear() + "-" + pad(datetime.getMonth()+1) + "-" + pad(datetime.getDate());
            timevalue = pad(datetime.getHours()) + ":" + pad(datetime.getMinutes()) + ":" + pad(datetime.getSeconds());
            self.set_field(self, "TimeValue", timevalue);
            self.set_field(self, "DateValue", datevalue);
        }
        else if (self.has_date) 
        {
            datevalue = datetime.getFullYear() + "-" + pad(datetime.getMonth()+1) + "-" + pad(datetime.getDate());
            self.set_field(self, "DateValue", datevalue);
        }
        else 
        {
            timevalue = pad(datetime.getHours()) + ":" + pad(datetime.getMinutes()) + ":" + pad(datetime.getSeconds());
            self.set_field(self, "TimeValue", state.state);
        }

    }

    function pad(n) 
    {
        return n<10 ? '0'+n : n;
    }
}


function baseinputnumber(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    self.onChange = onChange

    var callbacks = [
            {"observable": "SliderValue", "action": "change", "callback": self.onChange},
                    ]


            // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        self.state = state.state
        self.minvalue = state.attributes.min
        self.maxvalue = state.attributes.max
        self.stepvalue = state.attributes.step
        set_options(self, self.minvalue, self.maxvalue, self.stepvalue, state)
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        self.state = state.state
        set_value(self, state)
    }

    function set_value(self, state)
    {
        value = self.map_state(self, state.state)
        self.set_field(self, "SliderValue", value)
        self.set_field(self, "sliderValue", self.format_number(self,value))
    }

    function onChange(self, state)
    {
        if (self.state != self.ViewModel.SliderValue())
        {
            self.state = self.ViewModel.SliderValue()
	    args = self.parameters.post_service
            args["value"] = self.state
	    self.call_service(self, args)
        }
    }

    function set_options(self, minvalue, maxvalue, stepvalue, state)
    {
        //alert(self.maxvalue)
        self.set_field(self, "MinValue", minvalue)
        self.set_field(self, "MaxValue", maxvalue)
        self.set_field(self, "minValue", self.format_number(self,minvalue))
        self.set_field(self, "maxValue", self.format_number(self,maxvalue))
        self.set_field(self, "StepValue", stepvalue)
    }

}
function baseheater(widget_id, url, skin, parameters)
{  
    self = this
    self.widget_id = widget_id
    self.parameters = parameters
    
    if ("monitored_entity" in self.parameters)
    {
        entity = self.parameters.monitored_entity
    }
    else
    {
        icon_entity = self.parameters.icon_entity
        slider_entity = self.parameters.slider_entity
    }
    
       
    self.onChange = onChange
    self.OnButtonClick = OnButtonClick

    var callbacks = [
            {"selector": '#' + widget_id + ' > span', "action": "click", "callback": self.OnButtonClick},
            {"observable": "Temperature", "action": "change", "callback": self.onChange},
                    ]

    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("icon_entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.icon_entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
                {"entity": parameters.slider_entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  


    function OnStateAvailable(self, state)
    {    
        if ("min" in state.attributes)
        {
            self.minvalue = state.attributes.min
            self.maxvalue = state.attributes.max
            self.stepvalue = state.attributes.step
            self.thermovalue = state.state
            set_options(self, self.minvalue, self.maxvalue, self.stepvalue, self.thermovalue)            
        }
        else
        {
            self.state = state.state
            set_iconview(self, self.state)
        }
    }
 
    function OnStateUpdate(self, state)
    {
        if ("min" in state.attributes)
        {
            self.thermovalue = state.state
            set_sliderview(self, self.thermovalue)            
        }
        else
        {
            self.state = state.state
            set_iconview(self, self.state)
        }
    }

    function OnButtonClick(self)
    {
        if (self.state == "off")
        {
            args = self.parameters.post_service_active 
        }
        else
        {
            args = self.parameters.post_service_inactive
        }
        //alert(args)
        self.call_service(self, args)
        toggle(self)
    }

    function onChange(self, state)
    {
        if (self.thermovalue != self.ViewModel.Temperature())
        {
            self.thermovalue = self.ViewModel.Temperature()
            args = self.parameters.post_service_slider_change 
            args["value"] = self.thermovalue
	    self.call_service(self, args)
        }
    }

    function toggle(self)
    {
        if (self.state == "on")
        {
            self.state = "off";
        }
        else
        {
            self.state = "on";
        }
        set_iconview(self, self.state)
    }

    function set_options(self, minvalue, maxvalue, stepvalue, state)
    {
        self.set_field(self, "MinValue", minvalue)
        self.set_field(self, "MaxValue", maxvalue)
        self.set_field(self, "StepValue", stepvalue)
        self.set_field(self, "Temperature", state)
    }

    function set_iconview(self, state)
    {        
        if (state == "on")
        {
            self.set_icon(self, "icon", self.icons.icon_on)
            self.set_field(self, "icon_style", self.css.icon_style_active)
        }
        else
        {
            self.set_icon(self, "icon", self.icons.icon_off)
            self.set_field(self, "icon_style", self.css.icon_style_inactive)
        }
    }

    function set_sliderview(self, state)
    {
        if (typeof state == 'undefined')
        {
            self.set_field(self, "Temperature", 0)
        }
        else
        {
            self.set_field(self, "Temperature", state)
        }
    }

}
function baseweather(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...

    self = this;

    // Initialization

    self.widget_id = widget_id;

    // Parameters may come in useful later on

    self.parameters = parameters;

    var callbacks = [];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    // Map will be used to know what field are we going to update from what sensor
    self.entities_map = {}

    var monitored_entities = []

    var entities = $.extend({}, parameters.entities, parameters.sensors);
    for (var key in entities)
    {
        var entity = entities[key]
        if (entity != '' && check_if_forecast_sensor(parameters.show_forecast, entity))
        {
            monitored_entities.push({
                "entity": entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate
            })
            self.entities_map[entity] = key
        }
    }

    // If forecast is disabled - don't monitor the forecast sensors
    function check_if_forecast_sensor(show_forecast, entity)
    {
        if (show_forecast)
        {
          return true
        }
        else if(entity.substring(entity.length - 2) === "_1")
        {
          return false
        }
        else
        {
          return true
        }
    }
    // Finally, call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions

    // The OnStateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateUpdate(self, state)
    {
        set_view(self, state)
    }

    function OnStateAvailable(self, state)
    {
        field = self.entities_map[state.entity_id]
        if (field == 'temperature')
        {
            self.set_field(self, "unit", state.attributes.unit_of_measurement)
        }
        else if (field == 'wind_speed')
        {
            self.set_field(self, "wind_unit", state.attributes.unit_of_measurement)
        }
        else if (field == 'pressure')
        {
            self.set_field(self, "pressure_unit", state.attributes.unit_of_measurement)
        }
        else if (field == 'precip_intensity')
        {
            self.set_field(self, "rain_unit", state.attributes.unit_of_measurement)
        }
        set_view(self, state)
    }

    function set_view(self, state)
    {
        field = self.entities_map[state.entity_id]
        if (field)
        {
            if (field == 'icon' || field == 'forecast_icon')
            {
                self.set_field(self, field, state.state)
                return
            }

            if (field == 'precip_type')
            {
                self.set_field(self, "precip_type_icon", self.parameters.icons[state.state])
            }
            else if (field == 'forecast_precip_type')
            {
                self.set_field(self, "forecast_precip_type_icon", self.parameters.icons[state.state])
            }
            else if (field == 'wind_bearing')
            {
                var counts = [45, 90, 135, 180, 225, 270, 315]
                var goal = (parseInt(state.state) + 270) % 360
                var closest = counts.reduce(function(prev, curr) {
                      return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
                });
                self.set_field(self, "bearing_icon", "mdi-rotate-" + closest)
            }
            self.set_field(self, field, self.format_number(self, state.state))
        }
    }
}

function baseAdminSummary(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
       
    var callbacks = [];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
    
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    var monitored_entities =  [];

    window[self.widget_id] = {}
    window[self.widget_id]["entities"] = {}
    if ("entities" in parameters && parameters.entities != "")
    {
        counter = 0
        for (let entity in parameters.entities)
        {
            counter_str = counter.toString()
            monitored_entities.push({"entity": entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate})
            window[self.widget_id]["entities"][counter_str] = {}
            window[self.widget_id]["entities"][counter_str]["name"] = entity
            window[self.widget_id]["entities"][counter_str]["title"] = parameters.entities[entity]["title"]
            window[self.widget_id]["entities"][counter_str]["title_style"] = parameters.entities[entity]["title_style"]
            window[self.widget_id]["entities"][counter_str]["sensor_style"] = parameters.entities[entity]["sensor_style"]
            counter = counter + 1
        }
        window[self.widget_id]["entity_amount"] = counter
    }


    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods


    // create the HTML table
    table_style = ""
    if ("table_style" in parameters.table){
        table_style = parameters.table.table_style;
    }
    table_container ='<span data-bind="attr:{style: container_style}" ><table style="' + table_style + '">';
    if (parameters.table.fill_style = "vertical")
    { 
        entity_nr = 0
        for (var i=0; i<parameters.table.sensor_height; i++)
        {
            table_container = table_container + "<tr>"
            for (var j=0; j<parameters.table.sensor_width; j++)
            {
                sensor_style = ""
                sensor_title_style = ""
                if (window[self.widget_id]["entities"][entity_nr]["sensor_style"] !== undefined){
                    sensor_style = window[self.widget_id]["entities"][entity_nr]["sensor_style"]
                }
                if (window[self.widget_id]["entities"][entity_nr]["title"] !== undefined){
                    sensor_name = window[self.widget_id]["entities"][entity_nr]["title"]
                } else {
                    sensor_name = window[self.widget_id]["entities"][entity_nr]["name"]
                }
                if (window[self.widget_id]["entities"][entity_nr]["title_style"] !== undefined){
                    sensor_title_style = window[self.widget_id]["entities"][entity_nr]["title_style"]
                }
                table_container = table_container + "<td style='" + sensor_title_style + "'>" + sensor_name + "</td>"
                table_container = table_container + "<td style='" + sensor_style + "' id='" + self.widget_id + window[self.widget_id]["entities"][entity_nr]["name"] + "_value'></td>"
                entity_nr = entity_nr + 1
            }
            table_container = table_container + "</tr>"
        }
    }
    else
    {
        entity_nr = 0
        for (var i=0; i<parameters.table.sensor_width; i++)
        {
            table_container = table_container + "<tr>"
            for (var j=0; j<parameters.table.sensor_height; j++)
            {
                sensor_style = ""
                sensor_title_style = ""
                if (window[self.widget_id]["entities"][entity_nr]["sensor_style"] !== undefined){
                    sensor_style = window[self.widget_id]["entities"][entity_nr]["sensor_style"]
                }
                if (window[self.widget_id]["entities"][entity_nr]["title"] !== undefined){
                    sensor_name = window[self.widget_id]["entities"][entity_nr]["title"]
                } else {
                    sensor_name = window[self.widget_id]["entities"][entity_nr]["name"]
                }
                if (window[self.widget_id]["entities"][entity_nr]["title_style"] !== undefined){
                    sensor_title_style = window[self.widget_id]["entities"][entity_nr]["title_style"]
                }
                table_container = table_container + "<td style='" + sensor_title_style + "'>" + sensor_name + "</td>"
                table_container = table_container + "<td style='" + sensor_style + "' id='" + self.widget_id + window[self.widget_id]["entities"][entity_nr]["name"] + "_value'></td>"
                entity_nr = entity_nr + 1
            }
            table_container = table_container + "</tr>"
        }
    }
    table_container = table_container + "</table></span>"
    document.getElementById(self.widget_id).innerHTML = document.getElementById(self.widget_id).innerHTML + table_container;


    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);



    function OnStateAvailable(self, state, entity)
    {    
        set_value(self, state, entity)
    }
 
    function OnStateUpdate(self, state, entity)
    {
        set_value(self, state, entity)
    }

    function set_value(self, state, entity)
    {
        //console.log(state)
        value = state.state
        if ("attribute" in self.parameters.entities[entity]){
            value = state.attributes[self.parameters.entities[entity]["attribute"]]
        }
        field = self.widget_id + entity + "_value"
        //console.log(field + " set to " + value)
        document.getElementById(field).innerHTML = value
        //self.set_field(self, field, self.format_number(self, value)) 
    }

}

function baseclock(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Parameters may come in useful later on
    
    self.parameters = parameters
    
    // Define callbacks for on click events
    // They are defined as functions below and can be any name as long as the
    // 'self'variables match the callbacks array below
    // We need to add them into the object for later reference
   
    var callbacks = []        
     
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    var monitored_entities = []
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    
	updateTime(self)
	
	setInterval(updateTime, 500, self);

	function updateTime(self) 
	{
		var today = new Date();
		h = today.getHours();
		m = today.getMinutes();
		s = today.getSeconds();
		m = formatTime(m);
		
		if ("date_format_country" in self.parameters)
		{
			if ("date_format_options" in self.parameters)
			{
				self.set_field(self, "date", today.toLocaleDateString(self.parameters.date_format_country, self.parameters.date_format_options));
			}
			else
			{
                        	self.set_field(self, "date", today.toLocaleDateString(self.parameters.date_format_country));
			}
		}
		else
		{
				self.set_field(self, "date", today.toLocaleDateString());
		}

		if ("time_format" in self.parameters && self.parameters.time_format == "24hr")
		{
			time = h + ":" + m;
			pm = ""
		}
		else
		{
			time = formatHours(h) + ":" + m;
			pm = " " + formatAmPm(h)
		}
		
		if ("show_seconds" in self.parameters && self.parameters.show_seconds == 1)
		{
			time = time + ":" + formatTime(s)
		}
		
		time = time + pm
		self.set_field(self, "time", time);
	}

	function formatTime(i)
	{
		if (i < 10 )
		{
			return "0" + i;
		}
		else
		{
			return i;
		}
	}

	function formatAmPm(h)
	{
		if (h >= 12)
		{
			return "PM";
		}
		else
		{
			return "AM";
		}
	}

	function formatHours(h)
	{
		if (h > 12)
		{
			return h - 12;
		}
		else if (h == 0)
		{
			return 12;
		}
		else
		{
			return h;
		}
	}
}

function baselight(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Parameters may come in useful later on
    
    self.parameters = parameters
    
    // Parameter handling
    
    if ("monitored_entity" in self.parameters)
    {
        entity = self.parameters.monitored_entity
    }
    else
    {
        entity = self.parameters.entity
    }
    
    if ("on_brightness" in self.parameters)
    {
        self.on_brightness = self.parameters.on_brightness
    }
    else
    {
        self.on_brightness = 127
    }
    
    // Define callbacks for on click events
    // They are defined as functions below and can be any name as long as the
    // 'self'variables match the callbacks array below
    // We need to add them into the object for later reference
   
    self.OnButtonClick = OnButtonClick
    self.OnRaiseLevelClick = OnRaiseLevelClick
    self.OnLowerLevelClick = OnLowerLevelClick
    
    var callbacks =
        [
            {"selector": '#' + widget_id + ' > span', "action": "click", "callback": self.OnButtonClick},
            {"selector": '#' + widget_id + ' #level-up', "action": "click", "callback": self.OnRaiseLevelClick},
            {"selector": '#' + widget_id + ' #level-down', "action": "click", "callback": self.OnLowerLevelClick},
        ]        
     
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    var monitored_entities = 
        [
            {"entity": entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
        ]
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    
    function OnStateAvailable(self, state)
    {        
        self.state = state.state;
        if ("brightness" in state.attributes)
        {
            self.level = state.attributes.brightness
        }
        else
        {
            self.level = 0
        }
        set_view(self, self.state, self.level)
    }
    
    // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter
    
    function OnStateUpdate(self, state)
    {
        self.state = state.state;
        if ("brightness" in state.attributes)
        {
            self.level = state.attributes.brightness
        }
        else
        {
            self.level = 0
        }

        set_view(self, self.state, self.level)
    }
    
    function OnButtonClick(self)
    {
        if (self.state == "off")
        {
            args = jQuery.extend(true, {}, self.parameters.post_service_active)
            if ("on_attributes" in self.parameters)
            {
                for (var attr in self.parameters.on_attributes)
                {
                    args[attr] = self.parameters.on_attributes[attr]
                }
            }
        }
        else
        {
            args = jQuery.extend(true, {}, self.parameters.post_service_inactive)
        }
        self.call_service(self, args)
        toggle(self)
    }

    function OnRaiseLevelClick(self)
    {
        self.level = self.level + 255/10;
        self.level = parseInt(self.level)
        if (self.level > 255)
        {
            self.level = 255
        }
        args = jQuery.extend(true, {}, self.parameters.post_service_active);
        args["brightness"] = self.level
        self.call_service(self, args)
    }

    function OnLowerLevelClick(self)
    {
        self.level = self.level - 255/10;
        if (self.level < 0)
        {
            self.level = 0;
        }
        self.level = parseInt(self.level)
        if (self.level == 0)
        {
            args = jQuery.extend(true, {}, self.parameters.post_service_inactive)
        }
        else
        {
            args = jQuery.extend(true, {}, self.parameters.post_service_active)
            args["brightness"] = self.level
        }
        self.call_service(self, args)             
    }

    function toggle(self)
    {
        if (self.state == "on")
        {
            self.state = "off";
            self.level = 0
        }
        else
        {
            self.state = "on";
        }
        set_view(self, self.state, self.level)
    }
    
    // Set view is a helper function to set all aspects of the widget to its 
    // current state - it is called by widget code when an update occurs
    // or some other event that requires a an update of the view
    
    function set_view(self, state, level)
    {
        
        if (state == "on")
        {
            // Set Icon will set the style correctly for an icon
            self.set_icon(self, "icon", self.icons.icon_on)
            // Set view will set the view for the appropriate field
            self.set_field(self, "icon_style", self.css.icon_style_active)
        }
        else
        {
            self.set_icon(self, "icon", self.icons.icon_off)
            self.set_field(self, "icon_style", self.css.icon_style_inactive)
        }
        if (typeof level == 'undefined')
        {
            self.set_field(self, "level", 0)
        }
        else
        {
            self.set_field(self, "level", Math.ceil((level*100/255) / 10) * 10)
        }
    }
}

function basegauge(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    var callbacks = []

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }

    self.gauge = new JustGage({
    parentNode: $('#' + widget_id + ' > div')[0],
    //id: "graph",
    value: 0,
    nogradient: true,
    levelColors: [self.parameters.low_color, self.parameters.med_color, self.parameters.high_color],
    labelFontColor: self.parameters.color,
    valueFontColor: self.parameters.color,
    levelColorsGradient: false,
    gaugeColor: self.parameters.bgcolor,
    symbol: self.parameters.units,
    min: self.parameters.min,
    max: self.parameters.max,
  });


    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function set_value(self, state)
    {
        self.gauge.refresh(state.state)
    }
}
function baseentitypicture(widget_id, url, skin, parameters)
{
    self = this
    
    // Initialization
    
    self.parameters = parameters;
    
    var callbacks = []

    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;
    
    var monitored_entities = 
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
        ]; 
    
    if ("base_url" in parameters && parameters.base_url != "") {
        self.base_url = parameters.base_url;
    }else{
        self.base_url = "";
    }
        
    // Call the parent constructor to get things moving   
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    function OnStateAvailable(self, state)
    {        
        set_view(self, state)
    }
    
    // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter
    
    function OnStateUpdate(self, state)
    {
        set_view(self, state)
    }

    function set_view(self, state)
    {
        if("entity_picture" in state.attributes){
            self.set_field(self, "img_inernal_src", self.base_url + state.attributes["entity_picture"]);
            self.set_field(self, "img_internal_style", "");            
        }else{
            self.set_field(self, "img_inernal_src", "");
            self.set_field(self, "img_internal_style", "display: none;");            
        }
    }
}
function basemedia(widget_id, url, skin, parameters)
{
    self = this;

    // Initialization

    self.widget_id = widget_id;

    // Parameters may come in useful later on

    self.parameters = parameters;

    self.OnPlayButtonClick = OnPlayButtonClick;
    self.OnPreviousButtonClick = OnPreviousButtonClick;
    self.OnNextButtonClick = OnNextButtonClick;
    self.OnRaiseLevelClick = OnRaiseLevelClick;
    self.OnLowerLevelClick = OnLowerLevelClick;

    self.min_level = 0;
    self.max_level = 1;

    if ("step" in self.parameters)
    {
        self.step = self.parameters.step / 100;
    }
    else
    {
        self.step = 0.1;
    }

    var callbacks =
        [
            {"selector": '#' + widget_id + ' #play', "action": "click", "callback": self.OnPlayButtonClick},
            {"selector": '#' + widget_id + ' #level-up', "action": "click", "callback": self.OnRaiseLevelClick},
            {"selector": '#' + widget_id + ' #level-down', "action": "click", "callback": self.OnLowerLevelClick},
            {"selector": '#' + widget_id + ' #previous', "action": "click", "callback": self.OnPreviousButtonClick},
            {"selector": '#' + widget_id + ' #next', "action": "click", "callback": self.OnNextButtonClick}
        ];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    var monitored_entities =
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
        ];

    // Finally, call the parent constructor to get things moving

    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions

    // The StateAvailable function will be called when
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

    function OnStateAvailable(self, state)
    {
        self.entity = state.entity_id;
        self.level = state.attributes.volume_level;
        set_view(self, state)
        if ("dump_capabilities" in self.parameters && self.parameters["dump_capabilities"] == "1")
        {
            display_supported_functions(self)
        }
    }

    // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter

    function OnStateUpdate(self, state)
    {
        self.level = state.attributes.volume_level;
        set_view(self, state)
    }

    function OnPlayButtonClick(self)
    {
        if (self.entity_state[self.entity].state !== "playing")
        {
            if (is_supported(self, "PLAY_MEDIA"))
            {
                args = self.parameters.post_service_play_pause;
                self.call_service(self, args)
            }
            else
            {
                console.log("Play attribute not supported")
            }
        }
        else
        {
            if (is_supported(self, "PAUSE"))
            {
                args = self.parameters.post_service_pause;
                self.call_service(self, args)
            }
            else if (is_supported(self, "STOP"))
            {
                args = self.parameters.post_service_stop;
                self.call_service(self, args)
            }
            else if (is_supported(self, "STOP"))
            {
                args = self.parameters.post_service_stop;
                self.call_service(self, args)
            }
            else
            {
                // Try Play/Pause
                args = self.parameters.post_service_play_pause;
                self.call_service(self, args)
            }
        }
    }

    function OnPreviousButtonClick(self)
    {
        if (is_supported(self, "PREVIOUS_TRACK"))
        {
            args = self.parameters.post_service_previous;
            self.call_service(self, args)
        }
        else
        {
            console.log("NEXT_TRACK attribute not supported")
        }
    }

    function OnNextButtonClick(self)
    {
        if (is_supported(self, "NEXT_TRACK"))
        {
            args = self.parameters.post_service_next;
            self.call_service(self, args)
        }
        else
        {
            console.log("NEXT_TRACK attribute not supported")
        }
    }



    function OnRaiseLevelClick(self)
    {
        self.level = Math.round((self.level + self.step) * 100) / 100;
        if (self.level > self.max_level)
        {
            self.level = self.max_level
        }

        args = self.parameters.post_service_level;
        args["volume_level"] = self.level;
        self.call_service(self, args)

    }

    function OnLowerLevelClick(self)
    {
        self.level = Math.round((self.level - self.step) * 100) / 100;
        if (self.level < self.min_level)
        {
            self.level = self.min_level
        }

        args = self.parameters.post_service_level;
        args["volume_level"] = self.level;
        self.call_service(self, args)


    }

    function set_view(self, state)
    {
        if (state.state === "playing")
        {
            self.set_field(self, "play_icon_style", self.css.icon_style_active)
            self.set_icon(self, "play_icon", self.icons.pause_icon)
        }
        else
        {
            self.set_field(self, "play_icon_style", self.css.icon_style_inactive)
            self.set_icon(self, "play_icon", self.icons.play_icon)
        }

        if ("media_artist" in state.attributes)
        {
            self.set_field(self, "artist", state.attributes.media_artist);
        }

        if ("media_album_name" in state.attributes)
        {
            self.set_field(self, "album", state.attributes.media_album_name)
        }
        if ("media_title" in state.attributes)
        {
            if ("truncate_name" in self.parameters)
            {
                name = state.attributes.media_title.substring(0, self.parameters.truncate_name);
            }
            else
            {
                name = state.attributes.media_title
            }
            self.set_field(self, "media_title", name);
        }
        if ("volume_level" in state.attributes)
        {
            self.set_field(self, "level", Math.round(state.attributes.volume_level * 100))
        }
        else
        {
            self.set_field(self, "level", 0)
        }

    }

    function is_supported(self, attr)
    {
        var support =
            {
                "PAUSE": 1,
                "SEEK": 2,
                "VOLUME_SET": 4,
                "VOLUME_MUTE": 8,
                "PREVIOUS_TRACK": 16,
                "NEXT_TRACK": 32,
                "TURN_ON": 128,
                "TURN_OFF": 256,
                "PLAY_MEDIA": 512,
                "VOLUME_STEP": 1024,
                "SELECT_SOURCE": 2048,
                "STOP": 4096,
                "CLEAR_PLAYLIST": 8192,
                "PLAY": 16384,
                "SHUFFLE_SET": 32768
            };

        var supported = self.entity_state[parameters.entity].attributes.supported_features;

        if (attr in support)
        {
            var attr_value = support[attr];
            if ((supported & attr_value) == attr_value)
            {
                return true
            }
            else
            {
                return false
            }
        }
        else
        {
            console.log("Unknown media player attribute: " + attr)
            return false
        }
    }

    function display_supported_functions(self)
    {
        console.log(self.parameters.entity);
        console.log("Supported Features: " + self.entity_state[parameters.entity].attributes.supported_features);
        console.log("PAUSE: " + is_supported(self, "PAUSE"))
        console.log("SEEK: " + is_supported(self, "SEEK"))
        console.log("VOLUME_SET: " + is_supported(self, "VOLUME_SET"))
        console.log("VOLUME_MUTE: " + is_supported(self, "VOLUME_MUTE"))
        console.log("PREVIOUS_TRACK: " + is_supported(self, "PREVIOUS_TRACK"))
        console.log("NEXT_TRACK: " + is_supported(self, "NEXT_TRACK"))
        console.log("TURN_ON: " + is_supported(self, "TURN_ON"))
        console.log("TURN_OFF: " + is_supported(self, "TURN_OFF"))
        console.log("PLAY_MEDIA: " + is_supported(self, "PLAY_MEDIA"))
        console.log("VOLUME_STEP: " + is_supported(self, "VOLUME_STEP"))
        console.log("SELECT_SOURCE: " + is_supported(self, "SELECT_SOURCE"))
        console.log("STOP: " + is_supported(self, "STOP"))
        console.log("CLEAR_PLAYLIST: " + is_supported(self, "CLEAR_PLAYLIST"))
        console.log("PLAY: " + is_supported(self, "PLAY"))
        console.log("SHUFFLE_SET: " + is_supported(self, "SHUFFLE_SET"))
    }
}

function baseAdminLog(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    self.parameters = parameters;
    
    
    log_style = ""
    if ("log_style" in self.parameters){
       log_style = self.parameters.log_style
    }   
    document.getElementById(self.widget_id).innerHTML = document.getElementById(self.widget_id).innerHTML + "<table style='" + log_style + "' id='" + self.widget_id + "_log'></table>";

    var callbacks = [];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    var monitored_entities =  [];


    monitored_entities.push({"entity": self.parameters.fields.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate})
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);
    parameters.namespace = "admin"
    service_args = {"service": "log_widget/start","log_lines": self.parameters.max_loglines, "entity": self.parameters.fields.entity}
    setTimeout(self.call_service, 1000, self, service_args);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state, entity)
    {    
        console.log("initial " + entity)
        //console.log(state)
    }
 
    function OnStateUpdate(self, state, entity)
    {
        //console.log(state)
        special_style = ""
        line_style = ""
        if ("logline_style" in self.parameters.fields){
            line_style = self.parameters.fields.logline_style
        }
        if ("special_css" in self.parameters.fields){
            for (let style_name in self.parameters.fields.special_css){
                _text = self.parameters.fields.special_css[style_name].check_for
                if (state.data.formatted_message.includes(_text)){
                    special_style = special_style + self.parameters.fields.special_css[style_name].line_style
                }
            }
        }
        if ("replace_text" in self.parameters.fields){
            for (let replace_name in self.parameters.fields.replace_text){
                _text = self.parameters.fields.replace_text[replace_name].check_for
                replace_text = self.parameters.fields.replace_text[replace_name].replace_with
                state.data.formatted_message = state.data.formatted_message.replace(_text,replace_text)
                //console.log("replace " + _text + " with " + replace_text)
            }
        }
        _style = line_style + special_style + "display: inline-block;float:left;"
        newlogline = "<tr>"
        if ("split_into_columns" in self.parameters){
            if ("max_columns" in self.parameters){
                newloglineparts = state.data.formatted_message.split(self.parameters.split_into_columns,self.parameters.max_columns)
            } else {
                newloglineparts = state.data.formatted_message.split(self.parameters.split_into_columns)
            }
            for (var i=0; i<newloglineparts.length; i++){
                cell_width = ""
                if ("cell_widths" in self.parameters){
                    if( i <= self.parameters.cell_widths.length){
                        cell_width = "width='" + self.parameters.cell_widths[i] + "'";
                    }
                }
                newlogline = newlogline + "<td " + cell_width + " style='" + _style + "' id='" + self.widget_id + "_logline'>" + newloglineparts[i] + "</td>"
            }
        } else {
            newlogline = newlogline + "<td style='" + _style + "' id='" + self.widget_id + "_logline'>" + state.data.formatted_message + "</td>"
        }
        newlogline = newlogline + "</tr>"
        document.getElementById(self.widget_id + "_log").innerHTML = newlogline + document.getElementById(self.widget_id + "_log").innerHTML
        logline_amount = $("#" + self.widget_id + "_log > tbody").length
        //console.log(logline_amount)
        loglines = document.getElementById(self.widget_id + "_log")
        for (var i=self.parameters.max_loglines; i<logline_amount; i++)
        {
            loglines.removeChild(loglines.lastChild);
        }
    }

}

function baseradial(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    var callbacks = []

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        activateChart(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function set_value(self, state)
    {
        self.gauge.value = state.state
       // self.gauge.update()
    }

    function activateChart(self, state) {
        self.gauge = new RadialGauge({
            renderTo: document.getElementById(self.widget_id).getElementsByClassName('gaugeclass')[0],
            type: 'radial-gauge',
            width: '120',
            height: '120',
            //valueInt: 2,
            //valueDec: 1,
            colorTitle: '#333',
            //minValue: 17,
            //maxValue: 25,
            //minorTicks: 2,
            //strokeTicks: true,
        })
        self.gauge.value = state.state
        self.gauge.update(self.parameters.settings)
        //self.gauge.draw()
    }
}
function baseicon(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Parameters may come in useful later on
    
    self.parameters = parameters;

    var callbacks = [];

    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    var monitored_entities = 
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
        ];
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    
    function OnStateAvailable(self, state)
    {        
        self.state = state.state;
        set_view(self, self.state)
    }
    
    // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter
    
    function OnStateUpdate(self, state)
    {
        self.state = state.state;
        set_view(self, self.state)
    }

    // Set view is a helper function to set all aspects of the widget to its 
    // current state - it is called by widget code when an update occurs
    // or some other event that requires a an update of the view
    
    function set_view(self, state, level)
    {
        if ("icons" in self.parameters)
        {
            if (state in self.parameters.icons)
            {
                self.set_icon(self, "icon", self.parameters.icons[state].icon);
                self.set_field(self, "icon_style", self.parameters.icons[state].style)
            }
            else if ("default" in self.parameters.icons)
            {
                self.set_icon(self, "icon", self.parameters.icons.default.icon);
                self.set_field(self, "icon_style", self.parameters.icons.default.style)
            }
            else
            {
                self.set_icon(self, "icon", "fa-circle-thin");
                self.set_field(self, "icon_style", "color: white")
            }

        }

        if ("state_text" in self.parameters && self.parameters.state_text == 1)
        {
            self.set_field(self, "state_text", self.map_state(self, state))
        }
    }
}

function basetext(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
    
    self.OnChange = OnChange;

    var callbacks = [
        {"observable": "TextValue", "action": "change", "callback": self.OnChange},
    ];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;

    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }


    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnChange(self, state)
    {
        if (self.state != self.ViewModel.TextValue())
        {
            self.state = self.ViewModel.TextValue()
            args = self.parameters.post_service
            args["value"] = self.state
            self.call_service(self, args)
        }

    }

    function OnStateAvailable(self, state)
    {   
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function set_value(self, state)
    {
        value = self.map_state(self, state.state)
        self.set_field(self, "TextValue", value)
    }

}
function basejavascript(widget_id, url, skin, parameters)
{
    // Store Args
    this.widget_id = widget_id
    this.parameters = parameters
    this.skin = skin
        
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
        
    // Define callbacks for on click events
    // They are defined as functions below and can be any name as long as the
    // 'self'variables match the callbacks array below
    // We need to add them into the object for later reference
   
    self.OnButtonClick = OnButtonClick

    var callbacks =
        [
            {"selector": '#' + widget_id + ' > span', "action": "click","callback": self.OnButtonClick},
        ]
       
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
    
    var monitored_entities = 
        []
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    
    if ("command" in parameters)
    {
        command = parameters.command
    }
    else if ("url" in parameters || "dashboard" in parameters)
    {
        if ("url" in parameters)
        {
            url = parameters.url
        }
        else
        {
            url = "/" + parameters.dashboard
        }
        var i = 0;

        if ("args" in parameters)
        {
            
            url = url + "?";
            
            for (var key in parameters.args)
            {
                if (i != 0)
                {
                    url = url + "&"
                }
                url = url + key + "=" + parameters.args[key];
                i++
            }
        }
        if ("skin" in parameters)
        {
            theskin = parameters.skin
        }
        else
        {
            theskin = skin
        }

        if (i == 0)
        {
            url = url + "?skin=" + theskin;
            i++
        }
        else
        {
            url = url + "&skin=" + theskin;
            i++
        }

        if ("sticky" in parameters)
        {
            if (i == 0)
            {
                url = url + "?sticky=" + parameters.sticky;
                i++
            }
            else
            {
                url = url + "&sticky=" + parameters.sticky;
                i++
            }
        }

        if ("return" in parameters)
        {
            if (i == 0)
            {
                url = url + "?return=" + parameters.return;
                i++
            }
            else
            {
                url = url + "&return=" + parameters.return;
                i++
            }
        }

        if ("timeout" in parameters)
        {
            if (i == 0)
            {
                url = url + "?timeout=" + parameters.timeout;
                i++
            }
            else
            {
                url = url + "&timeout=" + parameters.timeout;
                i++
            }
        }



        command = "window.location.href = '" + url + "'"
    }
    
    self.set_icon(self, "icon", self.icons.icon_inactive);
    self.set_field(self, "icon_style", self.css.icon_inactive_style);
    
    self.command = command;
    
    function OnButtonClick(self)
    {
        self.set_icon(self, "icon", self.icons.icon_active);
        self.set_field(self, "icon_style", self.css.icon_active_style);
        eval(self.command);
    }
}
function baseswitch(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;
    
    // Toggle needs to be referenced from self for the timeout function
    
    self.toggle = toggle;
    
    // Define callbacks for on click events
    // They are defined as functions below and can be any name as long as the
    // 'self'variables match the callbacks array below
    // We need to add them into the object for later reference
   
    self.OnButtonClick = OnButtonClick;
    
    if ("enable" in self.parameters && self.parameters.enable == 1)
    {
        var callbacks =
            [
                {"selector": '#' + widget_id + ' > span', "action": "click", "callback": self.OnButtonClick},
            ]
    }            
    else
    {
        var callbacks = []
    }        
    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    var monitored_entities = 
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
        ];
    
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    
    function OnStateAvailable(self, state)
    {        
        self.state = state.state;
        set_view(self, self.state)
    }
    
    // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter
    
    function OnStateUpdate(self, state)
    {
        if (!("ignore_state" in self.parameters) || self.parameters.ignore_state == 0)
        {
            self.state = state.state;
            set_view(self, self.state)
        }
    }
    
    function OnButtonClick(self)
    {
        if (self.state == self.parameters.state_active)
        {
            args = self.parameters.post_service_inactive
        }
        else
        {
            args = self.parameters.post_service_active
        }
        self.call_service(self, args);
        toggle(self);
        if ("momentary" in self.parameters)
        {
            setTimeout(function() { self.toggle(self) }, self.parameters["momentary"])
        }
    }
    
    function toggle(self)
    {
        if (self.state == self.parameters.state_active)
        {
            self.state = self.parameters.state_inactive;
        }
        else
        {
            self.state = self.parameters.state_active;
        }
        set_view(self, self.state)
    }
    
    // Set view is a helper function to set all aspects of the widget to its 
    // current state - it is called by widget code when an update occurs
    // or some other event that requires a an update of the view
    
    function set_view(self, state, level)
    {
        if (state == self.parameters.state_active || ("active_map" in self.parameters && self.parameters.active_map.includes(state)))
        {
            self.set_icon(self, "icon", self.icons.icon_on);
            self.set_field(self, "icon_style", self.css.icon_style_active)
        }
        else
        {
            self.set_icon(self, "icon", self.icons.icon_off);
            self.set_field(self, "icon_style", self.css.icon_style_inactive)
        }
        if ("state_text" in self.parameters && self.parameters.state_text == 1)
        {
            self.set_field(self, "state_text", self.map_state(self, state))
        }
    }
}

function basetemperature(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    var callbacks = []

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)  

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        drawChart(self, state)
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        set_value(self, state)
    }

    function set_value(self, state)
    {
        self.gauge.value = state.state
        //self.gauge.update()
    }
    function drawChart(self, state)
    {
        self.gauge = new LinearGauge({
            renderTo: document.getElementById(self.widget_id).getElementsByClassName('gaugeclass')[0],
            type: 'linear-gauge',
            width: '120',
            height: '120',
            valueInt: 2,
            valueDec: 1,
            colorTitle: '#333',
            minValue: 17,
            maxValue: 25,
            //majorTicks: [0, 5, 10, 15, 20, 25, 30, 35],
            minorTicks: 2,
            strokeTicks: true
        });
        self.gauge.value = state.state
        self.gauge.update(self.parameters.settings)
    }
}
function baseiframe(widget_id, url, skin, parameters)
{
    self = this
    
    // Initialization
    
    self.parameters = parameters;
    
    var callbacks = []
    
    var monitored_entities = []
    
    // Call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Set the url
    
    if ("url_list" in parameters || "img_list" in parameters || "entity_picture" in parameters)
    {
        self.index = 0;
        refresh_frame(self)
    }
    
    function refresh_frame(self)
    {
        if ("url_list" in self.parameters)
        {
            self.set_field(self, "frame_src", self.parameters.url_list[self.index]);
            self.set_field(self, "img_src", "/images/Blank.gif");
            size = self.parameters.url_list.length
        }
       else if ("img_list" in self.parameters)
        {
            var url = self.parameters.img_list[self.index];
            if (url.indexOf('?') > -1)
            {
                url = url + "&time=" + Math.floor((new Date).getTime()/1000);
            }
            else
            {
                url = url + "?time=" + Math.floor((new Date).getTime()/1000);
            }
            self.set_field(self, "img_src", url);
            size = self.parameters.img_list.length
        }
        else if ("entity_picture" in self.parameters)
        {
            var url = self.parameters.entity_picture;
            if (url.indexOf('?') > -1)
            {
                url = url + "&time=" + Math.floor((new Date).getTime()/1000);
            }
            else
            {
                url = url + "?time=" + Math.floor((new Date).getTime()/1000);
            }
            self.set_field(self, "img_src", url);
            size = 1
        }
        
        if ("refresh" in self.parameters)
        {
            self.index = self.index + 1;
            if (self.index == size)
            {
                self.index = 0;
            }
            setTimeout(function() {refresh_frame(self)}, self.parameters.refresh * 1000);
        }
    }
}
function baseerror(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this
    
    // Initialization
    
    self.widget_id = widget_id
    
    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters
       
    var callbacks = []

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity

    var monitored_entities =  []

    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks)

}
function basecamera(widget_id, url, skin, parameters)
{
    self = this

     // Initialization

     self.parameters = parameters;

     var callbacks = []

     self.OnStateAvailable = OnStateAvailable
    self.OnStateUpdate = OnStateUpdate

     var monitored_entities = 
        [
            {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate},
        ];

     // Call the parent constructor to get things moving

     WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

     // Set the url

     self.index = 0;
    refresh_frame(self)
    self.timeout = undefined

     function refresh_frame(self)
    {
        if ("base_url" in self.parameters && "access_token" in self) {
            var endpoint = '/api/camera_proxy/'
            if ('stream' in self.parameters && self.parameters.stream) {
                endpoint = '/api/camera_proxy_stream/'
            }

             var url = self.parameters.base_url + endpoint + self.parameters.entity + '?token=' + self.access_token 
        } 
        else 
        {
            var url = '/images/Blank.gif'
        }

         if (url.indexOf('?') > -1)
        {
            url = url + "&time=" + Math.floor((new Date).getTime()/1000);
        }
        else
        {
            url = url + "?time=" + Math.floor((new Date).getTime()/1000);
        }
        self.set_field(self, "img_src", url);
        self.index = 0

         var refresh = 10
         if ('stream' in self.parameters && self.parameters.stream == "on") {
            refresh = 0
        }
        if ("refresh" in self.parameters)
        {
            refresh = self.parameters.refresh
        }
 
        if (refresh > 0)
        {
            clearTimeout(self.timeout)
            self.timeout = setTimeout(function() {refresh_frame(self)}, refresh * 1000);
        }

     }

     // Function Definitions

     // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state

     function OnStateAvailable(self, state)
    {   
        self.state = state.state;
        self.access_token = state.attributes.access_token
        refresh_frame(self)
    }

     // The OnStateUpdate function will be called when the specific entity
    // receives a state update - its new values will be available
    // in self.state[<entity>] and returned in the state parameter

     function OnStateUpdate(self, state)
    {
        self.state = state.state;
        self.access_token = state.attributes.access_token
        refresh_frame(self)
    }

 } 
function baseselect(widget_id, url, skin, parameters)
{
    // Will be using "self" throughout for the various flavors of "this"
    // so for consistency ...
    
    self = this;
    
    // Initialization
    
    self.widget_id = widget_id;

    // Store on brightness or fallback to a default
        
    // Parameters may come in useful later on
    
    self.parameters = parameters;

    self.initial = 1

    self.onChange = onChange;

    var callbacks = [
        {"observable": "selectedoption", "action": "change", "callback": self.onChange}
                    ];

    // Define callbacks for entities - this model allows a widget to monitor multiple entities if needed
    // Initial will be called when the dashboard loads and state has been gathered for the entity
    // Update will be called every time an update occurs for that entity
     
    self.OnStateAvailable = OnStateAvailable;
    self.OnStateUpdate = OnStateUpdate;
    
    if ("entity" in parameters)
    {
        var monitored_entities = 
            [
                {"entity": parameters.entity, "initial": self.OnStateAvailable, "update": self.OnStateUpdate}
            ]
    }
    else
    {
        var monitored_entities =  []
    }
    // Finally, call the parent constructor to get things moving
    
    WidgetBase.call(self, widget_id, url, skin, parameters, monitored_entities, callbacks);

    // Function Definitions
    
    // The StateAvailable function will be called when 
    // self.state[<entity>] has valid information for the requested entity
    // state is the initial state
    // Methods

    function OnStateAvailable(self, state)
    {    
        self.state = state;
        self.options = state.attributes.options
        set_options(self, self.options, state);
        set_value(self, state)
    }
 
    function OnStateUpdate(self, state)
    {
        if (self.options != state.attributes.options)
        {
            self.options = state.attributes.options
            set_options(self, self.options, state);
        }
        if (self.state != state.state)
        { 
            self.state = state.state;
            set_value(self, state);
        }      
    }

    function set_value(self, state)
    {
        value = self.map_state(self, state.state);
        self.set_field(self, "selectedoption", value)
    }

    function onChange(self, state)
    {
        if (self.state != self.ViewModel.selectedoption())
        {
            self.state = self.ViewModel.selectedoption();
            if (self.initial != 1)
            {
                args = self.parameters.post_service;
                args["option"] = self.state;
                self.call_service(self, args)
            }
            else
            {
                self.initial = 0
            }
        }
    }

    function set_options(self, options, state)
    {
        self.set_field(self, "inputoptions", options)
    }

}


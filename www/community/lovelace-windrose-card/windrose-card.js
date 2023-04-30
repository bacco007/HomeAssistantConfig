class CardColors {
    constructor() {
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color');
        this.roseLines = 'rgb(160, 160, 160)';
        this.roseDirectionLetters = primaryColor;
        this.rosePercentages = primaryColor;
        this.barBorder = 'rgb(160, 160, 160)';
        this.barUnitName = primaryColor;
        this.barName = primaryColor;
        this.barUnitValues = primaryColor;
        this.barPercentages = 'black';
    }
}

class GlobalConfig {
}
GlobalConfig.defaultCardinalDirectionLetters = "NESW";
GlobalConfig.defaultWindspeedBarLocation = 'bottom';
GlobalConfig.defaultHoursToShow = 4;
GlobalConfig.defaultRefreshInterval = 300;
GlobalConfig.defaultWindDirectionCount = 16;
GlobalConfig.defaultWindDirectionUnit = 'degrees';
GlobalConfig.defaultInputSpeedUnit = 'mps';
GlobalConfig.defaultOutputSpeedUnit = 'bft';
GlobalConfig.defaultWindspeedBarFull = true;
GlobalConfig.defaultMatchingStategy = 'direction-first';
GlobalConfig.defaultDirectionSpeedTimeDiff = 1;
GlobalConfig.verticalBarHeight = 30;
GlobalConfig.horizontalBarHeight = 15;

class ColorUtil {
    getColorArray(count) {
        const startHue = 240;
        const endHue = 0;
        const saturation = 100;
        const lightness = 60;
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (startHue - (((startHue - endHue) / (count - 1)) * i));
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    }
}

class SpeedUnit {
    constructor(name, toMpsFunc, fromMpsFunc, speedRangeStep, speedRangeMax) {
        this.name = name;
        this.toMpsFunc = toMpsFunc;
        this.fromMpsFunc = fromMpsFunc;
        this.speedRangeStep = speedRangeStep;
        this.speedRangeMax = speedRangeMax;
        this.speedRanges = [];
    }
}
class SpeedRange {
    constructor(range, minSpeed, maxSpeed, color) {
        this.range = range;
        this.minSpeed = minSpeed;
        this.maxSpeed = maxSpeed;
        this.color = color;
    }
    isRangeMatch(speed) {
        //console.log(this.minSpeed, speed, this.maxSpeed,  speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1));
        return speed >= this.minSpeed && (speed < this.maxSpeed || this.maxSpeed === -1);
    }
}
class WindSpeedConverter {
    constructor(inputUnit, outputUnit, rangeStep, rangeMax, speedRanges) {
        this.inputUnit = inputUnit;
        this.outputUnit = outputUnit;
        this.rangeStep = rangeStep;
        this.rangeMax = rangeMax;
        this.speedRanges = speedRanges;
        this.bft = new SpeedUnit("Beaufort", (speed) => speed, (speed) => speed, undefined, undefined);
        this.mps = new SpeedUnit("m/s", (speed) => speed, (speed) => speed, 5, 30);
        this.kph = new SpeedUnit("km/h", (speed) => speed / 3.6, (speed) => speed * 3.6, 10, 100);
        this.mph = new SpeedUnit("m/h", (speed) => speed / 2.2369, (speed) => speed * 2.2369, 10, 70);
        this.fps = new SpeedUnit("ft/s", (speed) => speed / 3.2808399, (speed) => speed * 3.2808399, 10, 100);
        this.knots = new SpeedUnit("knots", (speed) => speed / 1.9438444924406, (speed) => speed * 1.9438444924406, 5, 60);
        this.inputSpeedUnit = this.getSpeedUnit(this.inputUnit);
        this.outputSpeedUnit = this.getSpeedUnit(this.outputUnit);
        if (outputUnit === 'bft') {
            this.outputSpeedUnit.speedRanges = this.generateBeaufortSpeedRanges(inputUnit);
        }
        else if (speedRanges && speedRanges.length > 0) {
            this.outputSpeedUnit.speedRanges = speedRanges;
        }
        else if (rangeStep && rangeMax) {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(rangeStep, rangeMax);
        }
        else {
            this.outputSpeedUnit.speedRanges = this.generateSpeedRanges(this.outputSpeedUnit.speedRangeStep, this.outputSpeedUnit.speedRangeMax);
        }
        //console.log('Speed ranges: ', this.outputSpeedUnit.speedRanges);
    }
    getOutputSpeedUnit() {
        return this.outputSpeedUnit;
    }
    getSpeedConverter() {
        if (this.inputUnit === this.outputUnit || this.outputUnit === 'bft') {
            return (inputSpeed) => inputSpeed;
        }
        else if (this.inputUnit === 'mps') {
            return this.outputSpeedUnit.fromMpsFunc;
        }
        const toMpsFunction = this.inputSpeedUnit.toMpsFunc;
        const fromMpsFunction = this.outputSpeedUnit.fromMpsFunc;
        return (speed) => fromMpsFunction(toMpsFunction(speed));
    }
    getRangeFunction() {
        return (speed) => {
            const speedRange = this.outputSpeedUnit.speedRanges.find(speedRange => speedRange.isRangeMatch(speed));
            if (speedRange) {
                return speedRange.range;
            }
            throw new Error("Speed is not in a speedrange: " + speed + " unit: " + this.outputUnit);
        };
    }
    getSpeedRanges() {
        return this.outputSpeedUnit.speedRanges;
    }
    getSpeedUnit(unit) {
        switch (unit) {
            case 'bft': return this.bft;
            case 'mps': return this.mps;
            case 'kph': return this.kph;
            case 'mph': return this.mph;
            case 'fps': return this.fps;
            case 'knots': return this.knots;
            default: throw new Error("Unknown speed unit: " + unit);
        }
    }
    generateSpeedRanges(step, max) {
        const colors = new ColorUtil().getColorArray(Math.floor(max / step) + 1);
        const speedRanges = [];
        let currentSpeed = 0;
        let range = 0;
        while (currentSpeed <= max - step) {
            speedRanges.push(new SpeedRange(range, currentSpeed, currentSpeed + step, colors[range]));
            range++;
            currentSpeed += step;
        }
        speedRanges.push(new SpeedRange(range, currentSpeed, -1, colors[range]));
        return speedRanges;
    }
    generateBeaufortSpeedRanges(inputUnit) {
        const colors = new ColorUtil().getColorArray(13);
        if (inputUnit === 'mps') {
            return [
                new SpeedRange(0, 0, 0.5, colors[0]),
                new SpeedRange(1, 0.5, 1.6, colors[1]),
                new SpeedRange(2, 1.6, 3.4, colors[2]),
                new SpeedRange(3, 3.4, 5.5, colors[3]),
                new SpeedRange(4, 5.5, 8, colors[4]),
                new SpeedRange(5, 8, 10.8, colors[5]),
                new SpeedRange(6, 10.8, 13.9, colors[6]),
                new SpeedRange(7, 13.9, 17.2, colors[7]),
                new SpeedRange(8, 17.2, 20.8, colors[8]),
                new SpeedRange(9, 20.8, 24.5, colors[9]),
                new SpeedRange(10, 24.5, 28.5, colors[10]),
                new SpeedRange(11, 28.5, 32.7, colors[11]),
                new SpeedRange(12, 32.7, -1, colors[12])
            ];
        }
        else if (inputUnit === 'kph') {
            return [
                new SpeedRange(0, 0, 2, colors[0]),
                new SpeedRange(1, 2, 6, colors[1]),
                new SpeedRange(2, 6, 12, colors[2]),
                new SpeedRange(3, 12, 20, colors[3]),
                new SpeedRange(4, 20, 29, colors[4]),
                new SpeedRange(5, 29, 39, colors[5]),
                new SpeedRange(6, 39, 50, colors[6]),
                new SpeedRange(7, 50, 62, colors[7]),
                new SpeedRange(8, 62, 75, colors[8]),
                new SpeedRange(9, 75, 89, colors[9]),
                new SpeedRange(10, 89, 103, colors[10]),
                new SpeedRange(11, 103, 118, colors[11]),
                new SpeedRange(12, 118, -1, colors[12])
            ];
        }
        else if (inputUnit === 'mph') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 8, colors[2]),
                new SpeedRange(3, 8, 13, colors[3]),
                new SpeedRange(4, 13, 19, colors[4]),
                new SpeedRange(5, 19, 25, colors[5]),
                new SpeedRange(6, 25, 32, colors[6]),
                new SpeedRange(7, 32, 39, colors[7]),
                new SpeedRange(8, 39, 47, colors[8]),
                new SpeedRange(9, 47, 55, colors[9]),
                new SpeedRange(10, 55, 64, colors[10]),
                new SpeedRange(11, 64, 73, colors[11]),
                new SpeedRange(12, 73, -1, colors[12])
            ];
        }
        else if (inputUnit === 'fps') {
            return [
                new SpeedRange(0, 0, 1.6, colors[0]),
                new SpeedRange(1, 1.6, 5.2, colors[1]),
                new SpeedRange(2, 5.2, 11.2, colors[2]),
                new SpeedRange(3, 11.2, 18, colors[3]),
                new SpeedRange(4, 18, 26.2, colors[4]),
                new SpeedRange(5, 26.2, 35.4, colors[5]),
                new SpeedRange(6, 35.4, 45.6, colors[6]),
                new SpeedRange(7, 45.6, 56.4, colors[7]),
                new SpeedRange(8, 56.4, 68.2, colors[8]),
                new SpeedRange(9, 68.2, 80.4, colors[9]),
                new SpeedRange(10, 80.4, 93.5, colors[10]),
                new SpeedRange(11, 93.5, 107, colors[11]),
                new SpeedRange(12, 107, -1, colors[12])
            ];
        }
        else if (inputUnit === 'knots') {
            return [
                new SpeedRange(0, 0, 1, colors[0]),
                new SpeedRange(1, 1, 4, colors[1]),
                new SpeedRange(2, 4, 7, colors[2]),
                new SpeedRange(3, 7, 11, colors[3]),
                new SpeedRange(4, 11, 17, colors[4]),
                new SpeedRange(5, 17, 22, colors[5]),
                new SpeedRange(6, 22, 28, colors[6]),
                new SpeedRange(7, 28, 34, colors[7]),
                new SpeedRange(8, 34, 41, colors[8]),
                new SpeedRange(9, 41, 48, colors[9]),
                new SpeedRange(10, 48, 56, colors[10]),
                new SpeedRange(11, 56, 64, colors[11]),
                new SpeedRange(12, 64, -1, colors[12])
            ];
        }
        throw new Error("No Bft reanges for input speed unit:: " + inputUnit);
    }
}

class CardConfigWrapper {
    static exampleConfig() {
        return {
            title: 'Wind direction',
            hours_to_show: GlobalConfig.defaultHoursToShow,
            max_width: 400,
            refresh_interval: GlobalConfig.defaultRefreshInterval,
            windspeed_bar_location: GlobalConfig.defaultWindspeedBarLocation,
            windspeed_bar_full: GlobalConfig.defaultWindspeedBarFull,
            wind_direction_entity: '',
            windspeed_entities: [
                {
                    entity: '',
                    name: ''
                }
            ],
            wind_direction_unit: GlobalConfig.defaultWindDirectionUnit,
            input_speed_unit: GlobalConfig.defaultInputSpeedUnit,
            output_speed_unit: GlobalConfig.defaultOutputSpeedUnit,
            speed_range_step: undefined,
            speed_range_max: undefined,
            speed_ranges: undefined,
            direction_compensation: 0,
            windrose_draw_north_offset: 0,
            cardinal_direction_letters: GlobalConfig.defaultCardinalDirectionLetters,
            matching_strategy: GlobalConfig.defaultMatchingStategy,
            direction_speed_time_diff: GlobalConfig.defaultDirectionSpeedTimeDiff,
        };
    }
    constructor(cardConfig) {
        this.cardConfig = cardConfig;
        this.speedRanges = [];
        this.title = this.cardConfig.title;
        this.hoursToShow = this.checkHoursToShow();
        this.refreshInterval = this.checkRefreshInterval();
        this.maxWidth = this.checkMaxWidth();
        this.windDirectionEntity = this.checkWindDirectionEntity();
        this.windspeedEntities = this.checkWindspeedEntities();
        this.windRoseDrawNorthOffset = this.checkwindRoseDrawNorthOffset();
        this.directionCompensation = this.checkDirectionCompensation();
        this.windspeedBarLocation = this.checkWindspeedBarLocation();
        this.windspeedBarFull = this.checkWindspeedBarFull();
        this.cardinalDirectionLetters = this.checkCardinalDirectionLetters();
        this.windDirectionCount = this.checkWindDirectionCount();
        this.windDirectionUnit = this.checkWindDirectionUnit();
        this.inputSpeedUnit = this.checkInputSpeedUnit();
        this.outputSpeedUnit = this.checkOutputSpeedUnit();
        this.speedRangeStep = this.checkSpeedRangeStep();
        this.speedRangeMax = this.checkSpeedRangeMax();
        this.speedRanges = this.checkSpeedRanges();
        this.checkSpeedRangeCombi();
        this.matchingStrategy = this.checkMatchingStrategy();
        this.directionSpeedTimeDiff = this.checkDirectionSpeedTimeDiff();
        this.filterEntitiesQueryParameter = this.createEntitiesQueryParameter();
        this.entities = this.createEntitiesArray();
        this.cardColor = this.checkCardColors();
    }
    windBarCount() {
        return this.windspeedEntities.length;
    }
    checkHoursToShow() {
        if (this.cardConfig.hours_to_show && isNaN(this.cardConfig.hours_to_show)) {
            throw new Error('WindRoseCard: Invalid hours_to_show, should be a number.');
        }
        else if (this.cardConfig.hours_to_show) {
            return this.cardConfig.hours_to_show;
        }
        return GlobalConfig.defaultHoursToShow;
    }
    checkRefreshInterval() {
        if (this.cardConfig.refresh_interval && isNaN(this.cardConfig.refresh_interval)) {
            throw new Error('WindRoseCard: Invalid refresh_interval, should be a number in seconds.');
        }
        else if (this.cardConfig.refresh_interval) {
            return this.cardConfig.refresh_interval;
        }
        return GlobalConfig.defaultRefreshInterval;
    }
    checkMaxWidth() {
        if (this.cardConfig.max_width && isNaN(this.cardConfig.max_width)) {
            throw new Error('WindRoseCard: Invalid max_width, should be a number in pixels.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid max_width, should be a positive number.');
        }
        else if (this.cardConfig.max_width) {
            return this.cardConfig.max_width;
        }
        return undefined;
    }
    checkWindDirectionEntity() {
        if (this.cardConfig.wind_direction_entity) {
            return this.cardConfig.wind_direction_entity;
        }
        throw new Error("WindRoseCard: No wind_direction_entity configured.");
    }
    checkWindspeedEntities() {
        if (!this.cardConfig.windspeed_entities || this.cardConfig.windspeed_entities.length == 0) {
            throw new Error('WindRoseCard: No wind_speed_entities configured, minimal 1 needed.');
        }
        return this.cardConfig.windspeed_entities;
    }
    checkDirectionCompensation() {
        if (this.cardConfig.direction_compensation && isNaN(this.cardConfig.direction_compensation)) {
            throw new Error('WindRoseCard: Invalid direction compensation, should be a number in degress between 0 and 360.');
        }
        else if (this.cardConfig.direction_compensation) {
            return this.cardConfig.direction_compensation;
        }
        return 0;
    }
    checkwindRoseDrawNorthOffset() {
        if (this.cardConfig.windrose_draw_north_offset && isNaN(this.cardConfig.windrose_draw_north_offset)) {
            throw new Error('WindRoseCard: Invalid render direction offset, should be a number in degress between 0 and 360.');
        }
        else if (this.cardConfig.windrose_draw_north_offset) {
            return this.cardConfig.windrose_draw_north_offset;
        }
        return 0;
    }
    checkWindspeedBarLocation() {
        if (this.cardConfig.windspeed_bar_location) {
            if (this.cardConfig.windspeed_bar_location !== 'bottom' && this.cardConfig.windspeed_bar_location !== 'right') {
                throw new Error('Invalid windspeed bar location ' + this.cardConfig.windspeed_bar_location +
                    '. Valid options: bottom, right');
            }
            return this.cardConfig.windspeed_bar_location;
        }
        return GlobalConfig.defaultWindspeedBarLocation;
    }
    checkWindspeedBarFull() {
        return this.cardConfig.windspeed_bar_full;
    }
    checkCardinalDirectionLetters() {
        if (this.cardConfig.cardinal_direction_letters) {
            if (this.cardConfig.cardinal_direction_letters.length !== 4) {
                throw new Error("Cardinal direction letters option should contain 4 letters.");
            }
            return this.cardConfig.cardinal_direction_letters;
        }
        return GlobalConfig.defaultCardinalDirectionLetters;
    }
    checkWindDirectionCount() {
        if (this.cardConfig.wind_direction_count) {
            if (isNaN(this.cardConfig.wind_direction_count) || this.cardConfig.wind_direction_count < 4 ||
                this.cardConfig.wind_direction_count > 32) {
                throw new Error("Wind direction count can a number between 4 and 32");
            }
            return this.cardConfig.wind_direction_count;
        }
        return GlobalConfig.defaultWindDirectionCount;
    }
    checkWindDirectionUnit() {
        if (this.cardConfig.wind_direction_unit) {
            if (this.cardConfig.wind_direction_unit !== 'degrees'
                && this.cardConfig.wind_direction_unit !== 'letters') {
                throw new Error('Invalid wind direction unit configured: ' + this.cardConfig.wind_direction_unit +
                    '. Valid options: degrees, letters');
            }
            return this.cardConfig.wind_direction_unit;
        }
        return GlobalConfig.defaultWindDirectionUnit;
    }
    checkInputSpeedUnit() {
        if (this.cardConfig.input_speed_unit) {
            if (this.cardConfig.input_speed_unit !== 'mps'
                && this.cardConfig.input_speed_unit !== 'kph'
                && this.cardConfig.input_speed_unit !== 'mph'
                && this.cardConfig.input_speed_unit !== 'fps'
                && this.cardConfig.input_speed_unit !== 'knots') {
                throw new Error('Invalid input windspeed unit configured: ' + this.cardConfig.input_speed_unit +
                    '. Valid options: mps, fps, kph, mph, knots');
            }
            return this.cardConfig.input_speed_unit;
        }
        return GlobalConfig.defaultInputSpeedUnit;
    }
    checkOutputSpeedUnit() {
        if (this.cardConfig.output_speed_unit) {
            if (this.cardConfig.output_speed_unit !== 'mps'
                && this.cardConfig.output_speed_unit !== 'kph'
                && this.cardConfig.output_speed_unit !== 'mph'
                && this.cardConfig.output_speed_unit !== 'fps'
                && this.cardConfig.output_speed_unit !== 'knots'
                && this.cardConfig.output_speed_unit !== 'bft') {
                throw new Error('Invalid output windspeed unit configured: ' + this.cardConfig.output_speed_unit +
                    '. Valid options: mps, fps, kph, mph, knots, bft');
            }
            return this.cardConfig.output_speed_unit;
        }
        return GlobalConfig.defaultOutputSpeedUnit;
    }
    checkSpeedRangeStep() {
        if (this.cardConfig.speed_range_step && isNaN(this.cardConfig.speed_range_step)) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_step, should be a positive number.');
        }
        else if (this.cardConfig.speed_range_step) {
            return this.cardConfig.speed_range_step;
        }
        return undefined;
    }
    checkSpeedRangeMax() {
        if (this.cardConfig.speed_range_max && isNaN(this.cardConfig.speed_range_max)) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.');
        }
        else if (this.cardConfig.max_width <= 0) {
            throw new Error('WindRoseCard: Invalid speed_range_max, should be a positive number.');
        }
        else if (this.cardConfig.speed_range_max) {
            return this.cardConfig.speed_range_max;
        }
        return undefined;
    }
    checkSpeedRanges() {
        const speedRangeConfigs = [];
        if (this.cardConfig.speed_ranges && this.cardConfig.speed_ranges.length > 0) {
            const sortSpeedRanges = this.cardConfig.speed_ranges.slice();
            sortSpeedRanges.sort((a, b) => a.from_value - b.from_value);
            const lastIndex = sortSpeedRanges.length - 1;
            for (let i = 0; i < lastIndex; i++) {
                speedRangeConfigs.push(new SpeedRange(i, sortSpeedRanges[i].from_value, sortSpeedRanges[i + 1].from_value, sortSpeedRanges[i].color));
            }
            speedRangeConfigs.push(new SpeedRange(lastIndex, sortSpeedRanges[lastIndex].from_value, -1, sortSpeedRanges[lastIndex].color));
        }
        return speedRangeConfigs;
    }
    checkSpeedRangeCombi() {
        if (this.outputSpeedUnit === 'bft' && (this.speedRangeStep || this.speedRangeMax)) {
            throw new Error("WindRoseCard: speed_range_step and/or speed_range_max should not be set when using output " +
                "speed unit Beaufort (bft). Beaufort uses fixed speed ranges.");
        }
        if ((this.speedRangeStep && !this.speedRangeMax) || (!this.speedRangeStep && this.speedRangeMax)) {
            throw new Error("WindRoseCard: speed_range_step and speed_range_max should both be set.");
        }
    }
    checkMatchingStrategy() {
        if (this.cardConfig.matching_strategy) {
            if (this.cardConfig.matching_strategy !== 'direction-first' && this.cardConfig.matching_strategy !== 'speed-first') {
                throw new Error('Invalid matching stategy ' + this.cardConfig.matching_strategy +
                    '. Valid options: direction-first, speed-first');
            }
            return this.cardConfig.matching_strategy;
        }
        return GlobalConfig.defaultMatchingStategy;
    }
    checkDirectionSpeedTimeDiff() {
        if (this.cardConfig.direction_speed_time_diff) {
            if (isNaN(this.cardConfig.direction_speed_time_diff)) {
                throw new Error("Direction speed time difference is not a number: " +
                    this.cardConfig.direction_speed_time_diff);
            }
            return this.cardConfig.direction_speed_time_diff;
        }
        return GlobalConfig.defaultDirectionSpeedTimeDiff;
    }
    createEntitiesQueryParameter() {
        return this.windDirectionEntity + ',' + this.windspeedEntities
            .map(config => config.entity)
            .join(',');
    }
    createEntitiesArray() {
        const entities = [];
        entities.push(this.windDirectionEntity);
        return entities.concat(this.windspeedEntities.map(config => config.entity));
    }
    checkCardColors() {
        const cardColors = new CardColors();
        if (this.cardConfig.colors) {
            if (this.cardConfig.colors.rose_direction_letters) {
                cardColors.roseDirectionLetters = this.cardConfig.colors.rose_direction_letters;
            }
            if (this.cardConfig.colors.rose_lines) {
                cardColors.roseLines = this.cardConfig.colors.rose_lines;
            }
            if (this.cardConfig.colors.rose_percentages) {
                cardColors.rosePercentages = this.cardConfig.colors.rose_percentages;
            }
            if (this.cardConfig.colors.bar_border) {
                cardColors.barBorder = this.cardConfig.colors.bar_border;
            }
            if (this.cardConfig.colors.bar_name) {
                cardColors.barName = this.cardConfig.colors.bar_name;
            }
            if (this.cardConfig.colors.bar_percentages) {
                cardColors.barPercentages = this.cardConfig.colors.bar_percentages;
            }
            if (this.cardConfig.colors.bar_unit_name) {
                cardColors.barUnitName = this.cardConfig.colors.bar_unit_name;
            }
            if (this.cardConfig.colors.bar_unit_values) {
                cardColors.barUnitValues = this.cardConfig.colors.bar_unit_values;
            }
        }
        return cardColors;
    }
}

class DrawUtil {
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
}

class WindBarData {
    constructor(speedRangePercentages) {
        this.speedRangePercentages = speedRangePercentages;
    }
}

class WindBarCalculator {
    constructor(config, windSpeedConverter) {
        this.speeds = [];
        this.modified = false;
        this.speedRangePercentages = [];
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter();
        this.rangeCount = this.windSpeedConverter.getSpeedRanges().length;
    }
    addSpeeds(speeds) {
        for (const speed of speeds) {
            this.speeds.push(this.speedConverterFunction(speed));
        }
        this.modified = true;
    }
    calculate() {
        if (this.modified) {
            this.calculateSpeedRangePercentages();
        }
        return new WindBarData(this.speedRangePercentages);
    }
    calculateSpeedRangePercentages() {
        const speedRangeCounts = Array(this.rangeCount).fill(0);
        for (const speed of this.speeds) {
            const windBft = this.speedRangeFunction(speed);
            if (windBft !== undefined && windBft >= 0) {
                speedRangeCounts[windBft]++;
            }
            else {
                console.log('Error: bft conversion failed, ', speed);
            }
        }
        this.speedRangePercentages = [];
        for (const speedRangeCount of speedRangeCounts) {
            this.speedRangePercentages.push(speedRangeCount / (this.speeds.length / 100));
        }
    }
}

class MeasurementMatcher {
    constructor(directionData, speedData, timeDiff) {
        this.directionData = directionData;
        this.speedData = speedData;
        this.timeDiff = timeDiff;
    }
    match(matchingStrategy) {
        if (matchingStrategy == 'speed-first') {
            return this.matchSpeedLeading();
        }
        else if (matchingStrategy === 'direction-first') {
            return this.matchDirectionLeading();
        }
        throw Error('Unkown matchfing strategy: ' + matchingStrategy);
    }
    matchSpeedLeading() {
        const matchedData = [];
        this.speedData.forEach((speed) => {
            const direction = this.findMatchingDirection(speed.lu);
            if (direction) {
                if (direction.s === '' || direction.s === null || isNaN(+direction.s)) {
                    console.log("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                }
                else {
                    matchedData.push(new DirectionSpeed(direction.s, +speed.s));
                }
            }
            else {
                console.log('No matching direction found for speed ' + speed.s + " at timestamp " + speed.lu);
            }
        });
        return matchedData;
    }
    findMatchingDirection(timestamp) {
        const selection = this.directionData.filter((direction) => direction.lu >= timestamp - this.timeDiff && direction.lu <= timestamp + 1);
        if (selection.length == 1) {
            return selection[0];
        }
        else if (selection.length > 1) {
            selection.sort((a, b) => b.lu - a.lu);
            return selection[0];
        }
        return undefined;
    }
    matchDirectionLeading() {
        const matchedData = [];
        this.directionData.forEach((direction) => {
            const speed = this.findMatchingSpeed(direction.lu);
            if (speed) {
                if (speed.s === '' || speed.s === null || isNaN(+speed.s)) {
                    console.log("Speed " + speed.s + " at timestamp " + speed.lu + " is not a number.");
                }
                else {
                    matchedData.push(new DirectionSpeed(direction.s, +speed.s));
                }
            }
            else {
                console.log('No matching speed found for direction ' + direction.s + " at timestamp " + direction.lu);
            }
        });
        return matchedData;
    }
    findMatchingSpeed(timestamp) {
        return this.speedData.find((speed) => speed.lu > timestamp - this.timeDiff && speed.lu < timestamp + this.timeDiff);
    }
}
class DirectionSpeed {
    constructor(direction, speed) {
        this.direction = direction;
        this.speed = speed;
    }
}

class WindBarConfig {
    constructor(label, posX, posY, height, length, orientation, full, inputUnit, outputUnit, barBorderColor, barUnitNameColor, barNameColor, barUnitValuesColor, barPercentagesColor) {
        this.label = label;
        this.posX = posX;
        this.posY = posY;
        this.height = height;
        this.length = length;
        this.orientation = orientation;
        this.full = full;
        this.inputUnit = inputUnit;
        this.outputUnit = outputUnit;
        this.barBorderColor = barBorderColor;
        this.barUnitNameColor = barUnitNameColor;
        this.barNameColor = barNameColor;
        this.barUnitValuesColor = barUnitValuesColor;
        this.barPercentagesColor = barPercentagesColor;
    }
}

class WindBarCanvas {
    constructor(config, windSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.outputUnitName = this.windSpeedConverter.getOutputSpeedUnit().name;
        this.speedRanges = this.windSpeedConverter.getOutputSpeedUnit().speedRanges;
    }
    drawWindBar(windBarData, canvasContext) {
        // console.log('Data', windBarData);
        if (this.config.orientation === 'horizontal') {
            this.drawBarLegendHorizontal(windBarData.speedRangePercentages, canvasContext);
        }
        else if (this.config.orientation === 'vertical') {
            this.drawBarLegendVertical(windBarData.speedRangePercentages, canvasContext);
        }
    }
    drawBarLegendVertical(speedRangePercentages, canvasContext) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }
        const lengthMaxRange = (this.config.length / highestRangeMeasured);
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.save();
        canvasContext.translate(this.config.posX, this.config.posY);
        canvasContext.rotate(DrawUtil.toRadians(-90));
        canvasContext.fillText(this.config.label, 0, 0);
        canvasContext.restore();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        let posY = this.config.posY;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange * -1;
            }
            else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.config.length - lengthMaxRange) / maxScale) * -1;
            }
            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(this.config.posX, posY, this.config.height, length);
            canvasContext.fill();
            canvasContext.textAlign = 'left';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            if (this.config.outputUnit === 'bft') {
                if (i == 12) {
                    canvasContext.fillText(i + '', this.config.posX + this.config.height + 5, posY - 6);
                }
                else {
                    canvasContext.fillText(i + '', this.config.posX + this.config.height + 5, posY + (length / 2));
                }
            }
            else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', this.config.posX + this.config.height + 5, posY);
            }
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, this.config.posX + (this.config.height / 2), posY + (length / 2));
            }
            canvasContext.stroke();
            posY += length;
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.config.posX, this.config.posY, this.config.height, this.config.length * -1);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.config.posX + (this.config.height / 2), this.config.posY - this.config.length - 2);
        canvasContext.fill();
    }
    drawBarLegendHorizontal(speedRangePercentages, canvasContext) {
        let highestRangeMeasured = speedRangePercentages.length;
        if (!this.config.full) {
            highestRangeMeasured = this.getIndexHighestRangeWithMeasurements(speedRangePercentages);
        }
        const lengthMaxRange = (this.config.length / highestRangeMeasured);
        const maxScale = this.speedRanges[highestRangeMeasured - 1].minSpeed;
        canvasContext.font = '13px Arial';
        canvasContext.textAlign = 'left';
        canvasContext.textBaseline = 'bottom';
        canvasContext.lineWidth = 1;
        canvasContext.fillStyle = this.config.barNameColor;
        canvasContext.fillText(this.config.label, this.config.posX, this.config.posY);
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'top';
        let posX = this.config.posX;
        for (let i = 0; i < highestRangeMeasured; i++) {
            if (i === highestRangeMeasured - 1) {
                length = lengthMaxRange;
            }
            else {
                length = (this.speedRanges[i + 1].minSpeed - this.speedRanges[i].minSpeed) * ((this.config.length - lengthMaxRange) / maxScale);
            }
            canvasContext.beginPath();
            canvasContext.fillStyle = this.speedRanges[i].color;
            canvasContext.fillRect(posX, this.config.posY, length, this.config.height);
            canvasContext.fill();
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barUnitValuesColor;
            if (this.config.outputUnit === 'bft') {
                canvasContext.fillText(i + '', posX + (length / 2), this.config.posY + this.config.height + 2);
            }
            else {
                canvasContext.fillText(this.speedRanges[i].minSpeed + '', posX, this.config.posY + this.config.height + 2);
            }
            canvasContext.textAlign = 'center';
            canvasContext.fillStyle = this.config.barPercentagesColor;
            if (speedRangePercentages[i] > 0) {
                canvasContext.fillText(`${Math.round(speedRangePercentages[i])}%`, posX + (length / 2), this.config.posY + 2);
            }
            canvasContext.stroke();
            posX += length;
        }
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.barBorderColor;
        canvasContext.rect(this.config.posX, this.config.posY, this.config.length, this.config.height);
        canvasContext.stroke();
        canvasContext.beginPath();
        canvasContext.textAlign = 'right';
        canvasContext.textBaseline = 'bottom';
        canvasContext.fillStyle = this.config.barUnitNameColor;
        canvasContext.fillText(this.outputUnitName, this.config.posX + this.config.length, this.config.posY);
        canvasContext.fill();
    }
    getIndexHighestRangeWithMeasurements(speedRangePercentages) {
        for (let i = speedRangePercentages.length - 1; i >= 0; i--) {
            if (speedRangePercentages[i] > 0) {
                return i + 1;
            }
        }
        return speedRangePercentages.length;
    }
}

class WindRoseCanvas {
    constructor(config, windSpeedConverter) {
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRanges = this.windSpeedConverter.getSpeedRanges();
        this.rangeCount = this.speedRanges.length;
    }
    drawWindRose(windRoseData, canvasContext) {
        // console.log('Drawing windrose', this.config.outerRadius);
        this.windRoseData = windRoseData;
        canvasContext.clearRect(0, 0, 700, 500);
        canvasContext.save();
        canvasContext.translate(this.config.centerX, this.config.centerY);
        canvasContext.rotate(DrawUtil.toRadians(this.config.windRoseDrawNorthOffset));
        this.drawBackground(canvasContext);
        this.drawWindDirections(canvasContext);
        this.drawCircleLegend(canvasContext);
        this.drawCenterZeroSpeed(canvasContext);
        canvasContext.restore();
    }
    drawWindDirections(canvasContext) {
        for (const windDirection of this.windRoseData.windDirections) {
            this.drawWindDirection(windDirection, canvasContext);
        }
    }
    drawWindDirection(windDirection, canvasContext) {
        if (windDirection.speedRangePercentages.length === 0)
            return;
        const percentages = Array(windDirection.speedRangePercentages.length).fill(0);
        for (let i = windDirection.speedRangePercentages.length - 1; i >= 0; i--) {
            percentages[i] = windDirection.speedRangePercentages[i];
            if (windDirection.speedRangePercentages[i] > 0) {
                for (let x = i - 1; x >= 1; x--) {
                    percentages[i] += windDirection.speedRangePercentages[x];
                }
            }
        }
        const maxRadius = (this.config.outerRadius - this.config.centerRadius) * (windDirection.directionPercentage / 100);
        for (let i = this.speedRanges.length - 1; i >= 1; i--) {
            this.drawSpeedPart(canvasContext, windDirection.centerDegrees - 90, (maxRadius * (percentages[i] / 100)) + this.config.centerRadius, this.speedRanges[i].color);
        }
    }
    drawSpeedPart(canvasContext, degrees, radius, color) {
        //var x = Math.cos(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        //var y = Math.sin(DrawUtil.toRadians(degreesCompensated - (this.config.leaveArc / 2)));
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 2;
        canvasContext.beginPath();
        canvasContext.moveTo(0, 0);
        //canvasContext.lineTo(this.config.centerX + x, this.config.centerY + y);
        canvasContext.arc(0, 0, radius, DrawUtil.toRadians(degrees - (this.config.leaveArc / 2)), DrawUtil.toRadians(degrees + (this.config.leaveArc / 2)));
        canvasContext.lineTo(0, 0);
        canvasContext.stroke();
        canvasContext.fillStyle = color;
        canvasContext.fill();
    }
    drawBackground(canvasContext) {
        // Clear
        canvasContext.clearRect(0, 0, 5000, 5000);
        // Cross
        canvasContext.lineWidth = 1;
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.moveTo(0 - this.config.outerRadius, 0);
        canvasContext.lineTo(this.config.outerRadius, 0);
        canvasContext.stroke();
        canvasContext.moveTo(0, 0 - this.config.outerRadius);
        canvasContext.lineTo(0, this.config.outerRadius);
        canvasContext.stroke();
        // console.log('Cirlce center:', this.config.centerX, this.config.centerY);
        // Cirlces
        canvasContext.strokeStyle = this.config.roseLinesColor;
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles;
        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            canvasContext.beginPath();
            canvasContext.arc(0, 0, this.config.centerRadius + (radiusStep * i), 0, 2 * Math.PI);
            canvasContext.stroke();
        }
        // Wind direction text
        const textCirlceSpace = 15;
        canvasContext.fillStyle = this.config.roseDirectionLettersColor;
        canvasContext.font = '22px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[0], 0, 0 - this.config.outerRadius - textCirlceSpace + 2);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[2], 0, this.config.outerRadius + textCirlceSpace);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[1], this.config.outerRadius + textCirlceSpace, 0);
        this.drawText(canvasContext, this.config.cardinalDirectionLetters[3], 0 - this.config.outerRadius - textCirlceSpace, 0);
    }
    drawCircleLegend(canvasContext) {
        canvasContext.font = "10px Arial";
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'bottom';
        const radiusStep = (this.config.outerRadius - this.config.centerRadius) / this.windRoseData.numberOfCircles;
        const centerXY = Math.cos(DrawUtil.toRadians(45)) * this.config.centerRadius;
        const xy = Math.cos(DrawUtil.toRadians(45)) * radiusStep;
        for (let i = 1; i <= this.windRoseData.numberOfCircles; i++) {
            const xPos = centerXY + (xy * i);
            const yPos = centerXY + (xy * i);
            //canvasContext.fillText((this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
            this.drawText(canvasContext, (this.windRoseData.percentagePerCircle * i) + "%", xPos, yPos);
        }
    }
    drawCenterZeroSpeed(canvasContext) {
        canvasContext.strokeStyle = this.config.roseLinesColor;
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.arc(0, 0, this.config.centerRadius, 0, 2 * Math.PI);
        canvasContext.stroke();
        canvasContext.fillStyle = this.speedRanges[0].color;
        canvasContext.fill();
        canvasContext.font = '12px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.textBaseline = 'middle';
        canvasContext.strokeStyle = this.config.rosePercentagesColor;
        canvasContext.fillStyle = this.config.rosePercentagesColor;
        this.drawText(canvasContext, Math.round(this.windRoseData.calmSpeedPercentage) + '%', 0, 0);
    }
    drawText(canvasContext, text, x, y) {
        canvasContext.save();
        canvasContext.translate(x, y);
        canvasContext.rotate(DrawUtil.toRadians(-this.config.windRoseDrawNorthOffset));
        canvasContext.fillText(text, 0, 0);
        canvasContext.restore();
    }
}

class WindDirectionData {
    constructor() {
        this.minDegrees = 0;
        this.centerDegrees = 0;
        this.maxDegrees = 0;
        this.speedRangePercentages = [];
        this.directionPercentage = 0;
    }
}

class WindDirectionCalculator {
    constructor(minDegrees, centerDegrees, maxDegrees, config, windSpeedConverter) {
        this.data = new WindDirectionData();
        this.speeds = [];
        this.speedRangeCounts = [];
        this.speedRangeCount = 0;
        this.data.centerDegrees = centerDegrees;
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter();
        this.speedRangeCount = this.windSpeedConverter.getSpeedRanges().length;
        if (minDegrees < 0) {
            this.data.minDegrees = minDegrees + 360;
        }
        else {
            this.data.minDegrees = minDegrees;
        }
        this.data.maxDegrees = maxDegrees;
    }
    clear() {
        this.speeds = [];
        this.speedRangeCounts = [];
        this.data.speedRangePercentages = [];
    }
    checkDirection(direction) {
        if (this.data.minDegrees > this.data.maxDegrees) {
            return direction > this.data.minDegrees || direction <= this.data.maxDegrees;
        }
        return direction > this.data.minDegrees && direction <= this.data.maxDegrees;
    }
    addSpeed(speed) {
        this.speeds.push(speed);
    }
    calculateDirectionPercentage(maxMeasurements) {
        this.data.directionPercentage = this.speeds.length / (maxMeasurements / 100);
    }
    calculateSpeedPercentages() {
        const speedRangeCounts = Array(this.speedRangeCount).fill(0);
        let speedAboveZeroCount = 0;
        for (const speed of this.speeds) {
            const speedRangeIndex = this.speedRangeFunction(speed);
            if (speedRangeIndex !== undefined && speedRangeIndex > 0) {
                speedRangeCounts[speedRangeIndex]++;
                speedAboveZeroCount++;
            }
        }
        if (speedAboveZeroCount === 0) {
            return Array(this.speedRangeCount).fill(0);
        }
        this.data.speedRangePercentages = [];
        for (const speedRangeCount of speedRangeCounts) {
            this.data.speedRangePercentages.push(speedRangeCount / (speedAboveZeroCount / 100));
        }
        return this.data.speedRangePercentages;
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$3=window,e$5=t$3.ShadowRoot&&(void 0===t$3.ShadyCSS||t$3.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$3=Symbol(),n$4=new WeakMap;class o$4{constructor(t,e,n){if(this._$cssResult$=!0,n!==s$3)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$5&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=n$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n$4.set(s,t));}return t}toString(){return this.cssText}}const r$3=t=>new o$4("string"==typeof t?t:t+"",void 0,s$3),i$3=(t,...e)=>{const n=1===t.length?t[0]:e.reduce(((e,s,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[n+1]),t[0]);return new o$4(n,t,s$3)},S$1=(s,n)=>{e$5?s.adoptedStyleSheets=n.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet)):n.forEach((e=>{const n=document.createElement("style"),o=t$3.litNonce;void 0!==o&&n.setAttribute("nonce",o),n.textContent=e.cssText,s.appendChild(n);}));},c$1=e$5?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var s$2;const e$4=window,r$2=e$4.trustedTypes,h$1=r$2?r$2.emptyScript:"",o$3=e$4.reactiveElementPolyfillSupport,n$3={toAttribute(t,i){switch(i){case Boolean:t=t?h$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,i){let s=t;switch(i){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t);}catch(t){s=null;}}return s}},a$1=(t,i)=>i!==t&&(i==i||t==t),l$2={attribute:!0,type:String,converter:n$3,reflect:!1,hasChanged:a$1};class d$1 extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this.u();}static addInitializer(t){var i;this.finalize(),(null!==(i=this.h)&&void 0!==i?i:this.h=[]).push(t);}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach(((i,s)=>{const e=this._$Ep(s,i);void 0!==e&&(this._$Ev.set(e,s),t.push(e));})),t}static createProperty(t,i=l$2){if(i.state&&(i.attribute=!1),this.finalize(),this.elementProperties.set(t,i),!i.noAccessor&&!this.prototype.hasOwnProperty(t)){const s="symbol"==typeof t?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,i);void 0!==e&&Object.defineProperty(this.prototype,t,e);}}static getPropertyDescriptor(t,i,s){return {get(){return this[i]},set(e){const r=this[t];this[i]=e,this.requestUpdate(t,r,s);},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||l$2}static finalize(){if(this.hasOwnProperty("finalized"))return !1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),void 0!==t.h&&(this.h=[...t.h]),this.elementProperties=new Map(t.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const t=this.properties,i=[...Object.getOwnPropertyNames(t),...Object.getOwnPropertySymbols(t)];for(const s of i)this.createProperty(s,t[s]);}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(i){const s=[];if(Array.isArray(i)){const e=new Set(i.flat(1/0).reverse());for(const i of e)s.unshift(c$1(i));}else void 0!==i&&s.push(c$1(i));return s}static _$Ep(t,i){const s=i.attribute;return !1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}u(){var t;this._$E_=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(t=this.constructor.h)||void 0===t||t.forEach((t=>t(this)));}addController(t){var i,s;(null!==(i=this._$ES)&&void 0!==i?i:this._$ES=[]).push(t),void 0!==this.renderRoot&&this.isConnected&&(null===(s=t.hostConnected)||void 0===s||s.call(t));}removeController(t){var i;null===(i=this._$ES)||void 0===i||i.splice(this._$ES.indexOf(t)>>>0,1);}_$Eg(){this.constructor.elementProperties.forEach(((t,i)=>{this.hasOwnProperty(i)&&(this._$Ei.set(i,this[i]),delete this[i]);}));}createRenderRoot(){var t;const s=null!==(t=this.shadowRoot)&&void 0!==t?t:this.attachShadow(this.constructor.shadowRootOptions);return S$1(s,this.constructor.elementStyles),s}connectedCallback(){var t;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostConnected)||void 0===i?void 0:i.call(t)}));}enableUpdating(t){}disconnectedCallback(){var t;null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostDisconnected)||void 0===i?void 0:i.call(t)}));}attributeChangedCallback(t,i,s){this._$AK(t,s);}_$EO(t,i,s=l$2){var e;const r=this.constructor._$Ep(t,s);if(void 0!==r&&!0===s.reflect){const h=(void 0!==(null===(e=s.converter)||void 0===e?void 0:e.toAttribute)?s.converter:n$3).toAttribute(i,s.type);this._$El=t,null==h?this.removeAttribute(r):this.setAttribute(r,h),this._$El=null;}}_$AK(t,i){var s;const e=this.constructor,r=e._$Ev.get(t);if(void 0!==r&&this._$El!==r){const t=e.getPropertyOptions(r),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==(null===(s=t.converter)||void 0===s?void 0:s.fromAttribute)?t.converter:n$3;this._$El=r,this[r]=h.fromAttribute(i,t.type),this._$El=null;}}requestUpdate(t,i,s){let e=!0;void 0!==t&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||a$1)(this[t],i)?(this._$AL.has(t)||this._$AL.set(t,i),!0===s.reflect&&this._$El!==t&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$E_=this._$Ej());}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach(((t,i)=>this[i]=t)),this._$Ei=void 0);let i=!1;const s=this._$AL;try{i=this.shouldUpdate(s),i?(this.willUpdate(s),null===(t=this._$ES)||void 0===t||t.forEach((t=>{var i;return null===(i=t.hostUpdate)||void 0===i?void 0:i.call(t)})),this.update(s)):this._$Ek();}catch(t){throw i=!1,this._$Ek(),t}i&&this._$AE(s);}willUpdate(t){}_$AE(t){var i;null===(i=this._$ES)||void 0===i||i.forEach((t=>{var i;return null===(i=t.hostUpdated)||void 0===i?void 0:i.call(t)})),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t);}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(t){return !0}update(t){void 0!==this._$EC&&(this._$EC.forEach(((t,i)=>this._$EO(i,this[i],t))),this._$EC=void 0),this._$Ek();}updated(t){}firstUpdated(t){}}d$1.finalized=!0,d$1.elementProperties=new Map,d$1.elementStyles=[],d$1.shadowRootOptions={mode:"open"},null==o$3||o$3({ReactiveElement:d$1}),(null!==(s$2=e$4.reactiveElementVersions)&&void 0!==s$2?s$2:e$4.reactiveElementVersions=[]).push("1.6.1");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var t$2;const i$2=window,s$1=i$2.trustedTypes,e$3=s$1?s$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,o$2=`lit$${(Math.random()+"").slice(9)}$`,n$2="?"+o$2,l$1=`<${n$2}>`,h=document,r$1=(t="")=>h.createComment(t),d=t=>null===t||"object"!=typeof t&&"function"!=typeof t,u=Array.isArray,c=t=>u(t)||"function"==typeof(null==t?void 0:t[Symbol.iterator]),v=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,a=/-->/g,f=/>/g,_=RegExp(">|[ \t\n\f\r](?:([^\\s\"'>=/]+)([ \t\n\f\r]*=[ \t\n\f\r]*(?:[^ \t\n\f\r\"'`<>=]|(\"|')|))|$)","g"),m=/'/g,p=/"/g,$=/^(?:script|style|textarea|title)$/i,g=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),y=g(1),x=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),T=new WeakMap,A=h.createTreeWalker(h,129,null,!1),E=(t,i)=>{const s=t.length-1,n=[];let h,r=2===i?"<svg>":"",d=v;for(let i=0;i<s;i++){const s=t[i];let e,u,c=-1,g=0;for(;g<s.length&&(d.lastIndex=g,u=d.exec(s),null!==u);)g=d.lastIndex,d===v?"!--"===u[1]?d=a:void 0!==u[1]?d=f:void 0!==u[2]?($.test(u[2])&&(h=RegExp("</"+u[2],"g")),d=_):void 0!==u[3]&&(d=_):d===_?">"===u[0]?(d=null!=h?h:v,c=-1):void 0===u[1]?c=-2:(c=d.lastIndex-u[2].length,e=u[1],d=void 0===u[3]?_:'"'===u[3]?p:m):d===p||d===m?d=_:d===a||d===f?d=v:(d=_,h=void 0);const y=d===_&&t[i+1].startsWith("/>")?" ":"";r+=d===v?s+l$1:c>=0?(n.push(e),s.slice(0,c)+"$lit$"+s.slice(c)+o$2+y):s+o$2+(-2===c?(n.push(void 0),i):y);}const u=r+(t[s]||"<?>")+(2===i?"</svg>":"");if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return [void 0!==e$3?e$3.createHTML(u):u,n]};class C{constructor({strings:t,_$litType$:i},e){let l;this.parts=[];let h=0,d=0;const u=t.length-1,c=this.parts,[v,a]=E(t,i);if(this.el=C.createElement(v,e),A.currentNode=this.el.content,2===i){const t=this.el.content,i=t.firstChild;i.remove(),t.append(...i.childNodes);}for(;null!==(l=A.nextNode())&&c.length<u;){if(1===l.nodeType){if(l.hasAttributes()){const t=[];for(const i of l.getAttributeNames())if(i.endsWith("$lit$")||i.startsWith(o$2)){const s=a[d++];if(t.push(i),void 0!==s){const t=l.getAttribute(s.toLowerCase()+"$lit$").split(o$2),i=/([.?@])?(.*)/.exec(s);c.push({type:1,index:h,name:i[2],strings:t,ctor:"."===i[1]?M:"?"===i[1]?k:"@"===i[1]?H:S});}else c.push({type:6,index:h});}for(const i of t)l.removeAttribute(i);}if($.test(l.tagName)){const t=l.textContent.split(o$2),i=t.length-1;if(i>0){l.textContent=s$1?s$1.emptyScript:"";for(let s=0;s<i;s++)l.append(t[s],r$1()),A.nextNode(),c.push({type:2,index:++h});l.append(t[i],r$1());}}}else if(8===l.nodeType)if(l.data===n$2)c.push({type:2,index:h});else {let t=-1;for(;-1!==(t=l.data.indexOf(o$2,t+1));)c.push({type:7,index:h}),t+=o$2.length-1;}h++;}}static createElement(t,i){const s=h.createElement("template");return s.innerHTML=t,s}}function P(t,i,s=t,e){var o,n,l,h;if(i===x)return i;let r=void 0!==e?null===(o=s._$Co)||void 0===o?void 0:o[e]:s._$Cl;const u=d(i)?void 0:i._$litDirective$;return (null==r?void 0:r.constructor)!==u&&(null===(n=null==r?void 0:r._$AO)||void 0===n||n.call(r,!1),void 0===u?r=void 0:(r=new u(t),r._$AT(t,s,e)),void 0!==e?(null!==(l=(h=s)._$Co)&&void 0!==l?l:h._$Co=[])[e]=r:s._$Cl=r),void 0!==r&&(i=P(t,r._$AS(t,i.values),r,e)),i}class V{constructor(t,i){this.u=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}v(t){var i;const{el:{content:s},parts:e}=this._$AD,o=(null!==(i=null==t?void 0:t.creationScope)&&void 0!==i?i:h).importNode(s,!0);A.currentNode=o;let n=A.nextNode(),l=0,r=0,d=e[0];for(;void 0!==d;){if(l===d.index){let i;2===d.type?i=new N(n,n.nextSibling,this,t):1===d.type?i=new d.ctor(n,d.name,d.strings,this,t):6===d.type&&(i=new I(n,this,t)),this.u.push(i),d=e[++r];}l!==(null==d?void 0:d.index)&&(n=A.nextNode(),l++);}return o}p(t){let i=0;for(const s of this.u)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class N{constructor(t,i,s,e){var o;this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cm=null===(o=null==e?void 0:e.isConnected)||void 0===o||o;}get _$AU(){var t,i;return null!==(i=null===(t=this._$AM)||void 0===t?void 0:t._$AU)&&void 0!==i?i:this._$Cm}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=P(this,t,i),d(t)?t===b||null==t||""===t?(this._$AH!==b&&this._$AR(),this._$AH=b):t!==this._$AH&&t!==x&&this.g(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):c(t)?this.k(t):this.g(t);}O(t,i=this._$AB){return this._$AA.parentNode.insertBefore(t,i)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}g(t){this._$AH!==b&&d(this._$AH)?this._$AA.nextSibling.data=t:this.T(h.createTextNode(t)),this._$AH=t;}$(t){var i;const{values:s,_$litType$:e}=t,o="number"==typeof e?this._$AC(t):(void 0===e.el&&(e.el=C.createElement(e.h,this.options)),e);if((null===(i=this._$AH)||void 0===i?void 0:i._$AD)===o)this._$AH.p(s);else {const t=new V(o,this),i=t.v(this.options);t.p(s),this.T(i),this._$AH=t;}}_$AC(t){let i=T.get(t.strings);return void 0===i&&T.set(t.strings,i=new C(t)),i}k(t){u(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const o of t)e===i.length?i.push(s=new N(this.O(r$1()),this.O(r$1()),this,this.options)):s=i[e],s._$AI(o),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){var s;for(null===(s=this._$AP)||void 0===s||s.call(this,!1,!0,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){var i;void 0===this._$AM&&(this._$Cm=t,null===(i=this._$AP)||void 0===i||i.call(this,t));}}class S{constructor(t,i,s,e,o){this.type=1,this._$AH=b,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=b;}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,i=this,s,e){const o=this.strings;let n=!1;if(void 0===o)t=P(this,t,i,0),n=!d(t)||t!==this._$AH&&t!==x,n&&(this._$AH=t);else {const e=t;let l,h;for(t=o[0],l=0;l<o.length-1;l++)h=P(this,e[s+l],i,l),h===x&&(h=this._$AH[l]),n||(n=!d(h)||h!==this._$AH[l]),h===b?t=b:t!==b&&(t+=(null!=h?h:"")+o[l+1]),this._$AH[l]=h;}n&&!e&&this.j(t);}j(t){t===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=t?t:"");}}class M extends S{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===b?void 0:t;}}const R=s$1?s$1.emptyScript:"";class k extends S{constructor(){super(...arguments),this.type=4;}j(t){t&&t!==b?this.element.setAttribute(this.name,R):this.element.removeAttribute(this.name);}}class H extends S{constructor(t,i,s,e,o){super(t,i,s,e,o),this.type=5;}_$AI(t,i=this){var s;if((t=null!==(s=P(this,t,i,0))&&void 0!==s?s:b)===x)return;const e=this._$AH,o=t===b&&e!==b||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==b&&(e===b||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){var i,s;"function"==typeof this._$AH?this._$AH.call(null!==(s=null===(i=this.options)||void 0===i?void 0:i.host)&&void 0!==s?s:this.element,t):this._$AH.handleEvent(t);}}class I{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){P(this,t);}}const z=i$2.litHtmlPolyfillSupport;null==z||z(C,N),(null!==(t$2=i$2.litHtmlVersions)&&void 0!==t$2?t$2:i$2.litHtmlVersions=[]).push("2.6.1");const Z=(t,i,s)=>{var e,o;const n=null!==(e=null==s?void 0:s.renderBefore)&&void 0!==e?e:i;let l=n._$litPart$;if(void 0===l){const t=null!==(o=null==s?void 0:s.renderBefore)&&void 0!==o?o:null;n._$litPart$=l=new N(i.insertBefore(r$1(),t),t,void 0,null!=s?s:{});}return l._$AI(t),l};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var l,o$1;class s extends d$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){var t,e;const i=super.createRenderRoot();return null!==(t=(e=this.renderOptions).renderBefore)&&void 0!==t||(e.renderBefore=i.firstChild),i}update(t){const i=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Z(i,this.renderRoot,this.renderOptions);}connectedCallback(){var t;super.connectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!0);}disconnectedCallback(){var t;super.disconnectedCallback(),null===(t=this._$Do)||void 0===t||t.setConnected(!1);}render(){return x}}s.finalized=!0,s._$litElement$=!0,null===(l=globalThis.litElementHydrateSupport)||void 0===l||l.call(globalThis,{LitElement:s});const n$1=globalThis.litElementPolyfillSupport;null==n$1||n$1({LitElement:s});(null!==(o$1=globalThis.litElementVersions)&&void 0!==o$1?o$1:globalThis.litElementVersions=[]).push("3.2.2");

var t$1,r;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none";}(t$1||(t$1={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24";}(r||(r={}));var ne=function(e,t,r,n){n=n||{},r=null==r?{}:r;var i=new Event(t,{bubbles:void 0===n.bubbles||n.bubbles,cancelable:Boolean(n.cancelable),composed:void 0===n.composed||n.composed});return i.detail=r,e.dispatchEvent(i),i};

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e$2(e){return class extends e{createRenderRoot(){const e=this.constructor,{registry:s,elementDefinitions:n,shadowRootOptions:o}=e;n&&!s&&(e.registry=new CustomElementRegistry,Object.entries(n).forEach((([t,s])=>e.registry.define(t,s))));const i=this.renderOptions.creationScope=this.attachShadow({...o,customElements:e.registry});return S$1(i,this.constructor.elementStyles),i}}}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=e=>n=>"function"==typeof n?((e,n)=>(customElements.define(e,n),n))(e,n):((e,n)=>{const{kind:t,elements:s}=n;return {kind:t,elements:s,finisher(n){customElements.define(e,n);}}})(e,n);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const i$1=(i,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?{...e,finisher(n){n.createProperty(e.key,i);}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:e.key,initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this));},finisher(n){n.createProperty(e.key,i);}};function e(e){return (n,t)=>void 0!==t?((i,e,n)=>{e.constructor.createProperty(n,i);})(e,n,t):i$1(e,n)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function t(t){return e({...t,state:!0})}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o=({finisher:e,descriptor:t})=>(o,n)=>{var r;if(void 0===n){const n=null!==(r=o.originalKey)&&void 0!==r?r:o.key,i=null!=t?{kind:"method",placement:"prototype",key:n,descriptor:t(o.key)}:{...o,key:n};return null!=e&&(i.finisher=function(t){e(t,n);}),i}{const r=o.constructor;void 0!==t&&Object.defineProperty(o,n,t(n)),null==e||e(r,n);}};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function i(i,n){return o({descriptor:o=>{const t={get(){var o,n;return null!==(n=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==n?n:null},enumerable:!0,configurable:!0};if(n){const n="symbol"==typeof o?Symbol():"__"+o;t.get=function(){var o,t;return void 0===this[n]&&(this[n]=null!==(t=null===(o=this.renderRoot)||void 0===o?void 0:o.querySelector(i))&&void 0!==t?t:null),this[n]};}return t}})}

/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var n;null!=(null===(n=window.HTMLSlotElement)||void 0===n?void 0:n.prototype.assignedElements)?(o,n)=>o.assignedElements(n):(o,n)=>o.assignedNodes(n).filter((o=>o.nodeType===Node.ELEMENT_NODE));

let WindRoseCardEditor = class WindRoseCardEditor extends e$2(s) {
    constructor() {
        super();
        this._initialized = false;
        //console.log('WindRoseCardEditor()');
    }
    setConfig(config) {
        this._config = config;
        this.loadCardHelpers();
    }
    shouldUpdate() {
        if (!this._initialized) {
            this._initialize();
        }
        return true;
    }
    get _title() {
        var _a;
        return ((_a = this._config) === null || _a === void 0 ? void 0 : _a.title) || '';
    }
    render() {
        //console.log('Render');
        if (!this.hass || !this._helpers) {
            return y ``;
        }
        // You can restrict on domain type
        Object.keys(this.hass.states);
        return y `
      <div>TESTTEST TEST</div>
      <mwc-textfield
        label="Name (Optional)"
        .value=${this.title}
        .configValue=${'title'}
        @input=${this._valueChanged}
      ></mwc-textfield>
    `;
    }
    _initialize() {
        if (this.hass === undefined)
            return;
        if (this._config === undefined)
            return;
        if (this._helpers === undefined)
            return;
        this._initialized = true;
    }
    async loadCardHelpers() {
        this._helpers = await window.loadCardHelpers();
    }
    _valueChanged(ev) {
        if (!this._config || !this.hass) {
            return;
        }
        const target = ev.target;
        // @ts-ignore
        if (this[`_${target.configValue}`] === target.value) {
            return;
        }
        if (target.configValue) {
            if (target.value === '') {
                const tmpConfig = Object.assign({}, this._config);
                // @ts-ignore
                delete tmpConfig[target.configValue];
                this._config = tmpConfig;
            }
            else {
                this._config = Object.assign(Object.assign({}, this._config), { [target.configValue]: target.checked !== undefined ? target.checked : target.value });
            }
        }
        ne(this, 'config-changed', { config: this._config });
    }
};
WindRoseCardEditor.elementDefinitions = {
//...textfieldDefinition,
// ...selectDefinition,
// ...switchDefinition,
// ...formfieldDefinition,
};
WindRoseCardEditor.styles = i$3 `
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
    mwc-switch {
      --mdc-theme-secondary: var(--switch-checked-color);
    }
  `;
__decorate([
    e({ attribute: false })
], WindRoseCardEditor.prototype, "hass", void 0);
__decorate([
    t()
], WindRoseCardEditor.prototype, "_config", void 0);
__decorate([
    t()
], WindRoseCardEditor.prototype, "_helpers", void 0);
WindRoseCardEditor = __decorate([
    e$1('windrose-card-editor')
], WindRoseCardEditor);

class WindRoseData {
    constructor() {
        this.windDirections = [];
        this.numberOfCircles = 0;
        this.percentagePerCircle = 0;
        this.calmSpeedPercentage = 10;
    }
}

class WindDirectionConverter {
    constructor() {
        this.directions = {
            N: 0,
            NXE: 11.25,
            NNE: 22.5,
            NEXN: 33.75,
            NE: 45,
            NEXE: 56.25,
            ENE: 67.5,
            EXN: 78.75,
            E: 90,
            EXS: 101.25,
            ESE: 112.50,
            SEXE: 123.75,
            SE: 135,
            SEXS: 146.25,
            SSE: 157.50,
            SXE: 168.75,
            S: 180,
            SXW: 191.25,
            SSW: 202.5,
            SWXS: 213.75,
            SW: 225,
            SWxW: 236.25,
            WSW: 247.5,
            WXS: 258.75,
            W: 270,
            WXN: 281.25,
            WNW: 292.50,
            NWXW: 303.75,
            NW: 315,
            NWXN: 326.25,
            NNW: 337.5,
            NXW: 348.5,
            CALM: 0
        };
    }
    getDirection(designation) {
        return this.directions[designation.toUpperCase()];
    }
}

class WindRoseCalculator {
    constructor(config, windSpeedConverter) {
        this.windDirectionConverter = new WindDirectionConverter();
        this.data = new WindRoseData();
        this.windDirections = [];
        this.modified = false;
        this.totalMeasurements = 0;
        this.maxMeasurementsDirection = 0;
        this.calmSpeedMeasurements = 0;
        this.config = config;
        this.windSpeedConverter = windSpeedConverter;
        this.speedRangeFunction = this.windSpeedConverter.getRangeFunction();
        this.speedConverterFunction = this.windSpeedConverter.getSpeedConverter();
        const leaveDegrees = 360 / config.windDirectionCount;
        for (let i = 0; i < config.windDirectionCount; i++) {
            const degrees = (i * leaveDegrees);
            const minDegrees = degrees - (leaveDegrees / 2);
            const maxDegrees = degrees + (leaveDegrees / 2);
            this.windDirections.push(new WindDirectionCalculator(minDegrees, degrees, maxDegrees, this.config, windSpeedConverter));
        }
    }
    clear() {
        this.totalMeasurements = 0;
        this.maxMeasurementsDirection = 0;
        this.calmSpeedMeasurements = 0;
        this.data.percentagePerCircle = 0;
        this.data.numberOfCircles = 0;
        this.data.calmSpeedPercentage = 0;
        for (const windDirection of this.windDirections) {
            windDirection.clear();
        }
    }
    addDataPoint(direction, speed) {
        const convertedSpeed = this.speedConverterFunction(speed);
        let degrees = 0;
        if (this.config.windDirectionUnit === 'letters') {
            degrees = this.windDirectionConverter.getDirection(direction);
            if (isNaN(degrees)) {
                throw new Error("Could not convert direction " + direction + " to degrees.");
            }
        }
        else {
            degrees = direction;
        }
        if (this.config.directionCompensation !== 0) {
            degrees = +degrees + this.config.directionCompensation;
            if (degrees < 0) {
                degrees = 360 + degrees;
            }
            else if (degrees >= 360) {
                degrees = degrees - 360;
            }
        }
        for (const windDirection of this.windDirections) {
            if (windDirection.checkDirection(degrees)) {
                windDirection.addSpeed(convertedSpeed);
                this.totalMeasurements++;
            }
        }
        if (this.speedRangeFunction(convertedSpeed) == 0) {
            this.calmSpeedMeasurements++;
        }
        this.modified = true;
    }
    calculate() {
        this.maxMeasurementsDirection = Math.max(...this.windDirections.map(windDirection => windDirection.speeds.length));
        for (const windDirection of this.windDirections) {
            windDirection.calculateDirectionPercentage(this.maxMeasurementsDirection);
        }
        this.calculateSpeedPercentages();
        this.calculateWindRosePercentages();
        this.data.windDirections = this.windDirections.map(windDirection => windDirection.data);
        //console.log(this.calmSpeedMeasurements, this.totalMeasurements);
        this.data.calmSpeedPercentage = this.calmSpeedMeasurements / (this.totalMeasurements / 100);
        return this.data;
    }
    calculateWindRosePercentages() {
        const maxRosePercentage = this.maxMeasurementsDirection / (this.totalMeasurements / 100);
        if (maxRosePercentage <= 30) {
            this.data.percentagePerCircle = Math.ceil(maxRosePercentage / 6);
            this.data.numberOfCircles = Math.ceil(maxRosePercentage / this.data.percentagePerCircle);
        }
        else {
            this.data.percentagePerCircle = Math.ceil(maxRosePercentage / 5);
            this.data.numberOfCircles = 5;
        }
    }
    calculateSpeedPercentages() {
        for (const windDirection of this.windDirections) {
            windDirection.calculateSpeedPercentages();
        }
    }
}

class WindRoseConfig {
    constructor(outerRadius, centerRadius, centerX, centerY, windDirectionCount, windDirectionUnit, leaveArc, cardinalDirectionLetters, directionCompensation, inputUnit, outputUnit, windRoseDrawNorthOffset, roseLinesColor, roseDirectionLettersColor, rosePercentagesColor) {
        this.outerRadius = outerRadius;
        this.centerRadius = centerRadius;
        this.centerX = centerX;
        this.centerY = centerY;
        this.windDirectionCount = windDirectionCount;
        this.windDirectionUnit = windDirectionUnit;
        this.leaveArc = leaveArc;
        this.cardinalDirectionLetters = cardinalDirectionLetters;
        this.directionCompensation = directionCompensation;
        this.inputUnit = inputUnit;
        this.outputUnit = outputUnit;
        this.windRoseDrawNorthOffset = windRoseDrawNorthOffset;
        this.roseLinesColor = roseLinesColor;
        this.roseDirectionLettersColor = roseDirectionLettersColor;
        this.rosePercentagesColor = rosePercentagesColor;
    }
}

class WindRoseConfigFactory {
    constructor(cardConfig) {
        this.cardConfig = cardConfig;
        this.roseCenterX = 0;
        this.roseCenterY = 0;
        this.outerRadius = 0;
        this.canvasHeight = 100;
        this.offsetWidth = 0;
    }
    createWindRoseConfig(canvasWidth) {
        this.calculateDimensions(canvasWidth);
        return new WindRoseConfig(this.outerRadius, 25, this.roseCenterX, this.roseCenterY, this.cardConfig.windDirectionCount, this.cardConfig.windDirectionUnit, (360 / this.cardConfig.windDirectionCount) - 5, this.cardConfig.cardinalDirectionLetters, this.cardConfig.directionCompensation, this.cardConfig.inputSpeedUnit, this.cardConfig.outputSpeedUnit, this.cardConfig.windRoseDrawNorthOffset, this.cardConfig.cardColor.roseLines, this.cardConfig.cardColor.roseDirectionLetters, this.cardConfig.cardColor.rosePercentages);
    }
    createWindBarConfigs(canvasWidth) {
        this.calculateDimensions(canvasWidth);
        const windBarConfigs = [];
        for (let i = 0; i < this.cardConfig.windspeedEntities.length; i++) {
            const entity = this.cardConfig.windspeedEntities[i];
            let windBarConfig;
            if (this.cardConfig.windspeedBarLocation === 'bottom') {
                windBarConfig = new WindBarConfig(entity.name, this.offsetWidth + 5, this.roseCenterY + this.outerRadius + 30 + ((GlobalConfig.horizontalBarHeight + 40) * i), GlobalConfig.horizontalBarHeight, ((this.outerRadius + 30) * 2), 'horizontal', this.cardConfig.windspeedBarFull, this.cardConfig.inputSpeedUnit, this.cardConfig.outputSpeedUnit, this.cardConfig.cardColor.barBorder, this.cardConfig.cardColor.barUnitName, this.cardConfig.cardColor.barName, this.cardConfig.cardColor.barUnitValues, this.cardConfig.cardColor.barPercentages);
            }
            else if (this.cardConfig.windspeedBarLocation === 'right') {
                windBarConfig = new WindBarConfig(entity.name, this.roseCenterX + this.outerRadius + 35 + ((GlobalConfig.verticalBarHeight + 60) * i), this.roseCenterY + this.outerRadius + 20, GlobalConfig.verticalBarHeight, this.outerRadius * 2 + 24, 'vertical', this.cardConfig.windspeedBarFull, this.cardConfig.inputSpeedUnit, this.cardConfig.outputSpeedUnit, this.cardConfig.cardColor.barBorder, this.cardConfig.cardColor.barUnitName, this.cardConfig.cardColor.barName, this.cardConfig.cardColor.barUnitValues, this.cardConfig.cardColor.barPercentages);
            }
            else {
                throw Error('Unknown windspeed bar location: ' + this.cardConfig.windspeedBarLocation);
            }
            windBarConfigs.push(windBarConfig);
        }
        return windBarConfigs;
    }
    calculateDimensions(canvasWidth) {
        let roseWidth = canvasWidth;
        if (this.cardConfig.maxWidth && canvasWidth > this.cardConfig.maxWidth) {
            roseWidth = this.cardConfig.maxWidth;
            this.offsetWidth = (canvasWidth - roseWidth) / 2;
        }
        if (this.cardConfig.windspeedBarLocation == 'right') {
            roseWidth = roseWidth - ((60 + 12) * this.cardConfig.windBarCount());
            this.offsetWidth = (canvasWidth - roseWidth - ((60 + 12) * this.cardConfig.windBarCount())) / 2;
        }
        this.outerRadius = (roseWidth / 2) - 35;
        this.roseCenterX = this.offsetWidth + (roseWidth / 2);
        this.roseCenterY = this.outerRadius + 25;
        if (this.cardConfig.windspeedBarLocation === 'right') {
            this.canvasHeight = this.roseCenterY + this.outerRadius + 25;
        }
        else if (this.cardConfig.windspeedBarLocation === 'bottom') {
            this.canvasHeight = this.roseCenterY + this.outerRadius + (40 * this.cardConfig.windBarCount()) + 35;
        }
        else ;
    }
}

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'windrose-card',
    name: 'Windrose Card',
    description: 'A card to show wind speed and direction in a windrose.',
});
/* eslint no-console: 0 */
console.info(`%c  WINROSE-CARD  %c Version 0.10.0 `, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');
let WindRoseCard = class WindRoseCard extends s {
    //
    // public static async getConfigElement(): Promise<HTMLElement> {
    //     //await import('./editor');
    //     return document.createElement('windrose-card-editor');
    // }
    static getStubConfig() {
        return CardConfigWrapper.exampleConfig();
    }
    constructor() {
        super();
        this.windBarCanvases = [];
        this.windBarCalculators = [];
        this.windBarsData = [];
        this.canvasWidth = 400;
        this.canvasHeight = 400;
        this.ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const cs = entry.contentRect;
                this.updateCanvasSize(cs.width - 32);
                if (this.windRoseData) {
                    this.requestUpdate();
                }
            }
        });
        // console.log("constructor()");
    }
    set hass(hass) {
        // console.log('SetHass', hass);
        this._hass = hass;
    }
    render() {
        var _a;
        super.render();
        //console.log('render()');
        return y `
            <ha-card header="${(_a = this.cardConfig) === null || _a === void 0 ? void 0 : _a.title}">
                <div class="card-content">
                    <canvas id="windRose"
                            width=${this.canvasWidth}
                            height=${this.canvasHeight}>
                    </canvas>
                </div>
            </ha-card>
        `;
    }
    firstUpdated() {
        //console.log('firstUpdated()');
        this.initWindRoseObjects(this.cardConfig, this.canvas.width);
        this.updateWindData();
        this.canvasContext = this.canvas.getContext('2d');
    }
    update(changedProperties) {
        super.update(changedProperties);
        this.drawWindRoseAndBar();
    }
    initInterval() {
        //console.log('Loop start');
        this.updateInterval = setInterval(() => this.updateWindData(), this.cardConfig.refreshInterval * 1000);
    }
    static get styles() {
        return i$3 `
          :host {
            display: block;
          }
          canvas {
            background-color: var(--ha-card-background);
            max-height: var(--chart-max-height);
          }`;
    }
    connectedCallback() {
        super.connectedCallback();
        this.ro.observe(this);
        this.initInterval();
        //console.log('connectedCallBack()');
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.ro.unobserve(this);
        clearInterval(this.updateInterval);
        //console.log('disconnectedCallback()');
    }
    setConfig(config) {
        //console.log('setConfig(): ', config);
        this.config = config;
        this.cardConfig = new CardConfigWrapper(config);
        if (this.canvas) {
            this.initWindRoseObjects(this.cardConfig, this.canvas.width);
            this.updateWindData();
            this.requestUpdate();
        }
    }
    getCardSize() {
        //console.log('getCardSize()');
        return 4;
    }
    initWindRoseObjects(cardConfig, canvasWidth) {
        //console.log('initWindRoseObjects(cardConfig, canvasWidth)', cardConfig, canvasWidth);
        this.windRoseConfigFactory = new WindRoseConfigFactory(cardConfig);
        const windRoseConfig = this.windRoseConfigFactory.createWindRoseConfig(canvasWidth);
        this.windSpeedConverter = new WindSpeedConverter(this.cardConfig.inputSpeedUnit, this.cardConfig.outputSpeedUnit, this.cardConfig.speedRangeStep, this.cardConfig.speedRangeMax, this.cardConfig.speedRanges);
        this.windRoseCalculator = new WindRoseCalculator(windRoseConfig, this.windSpeedConverter);
        this.windRoseCanvas = new WindRoseCanvas(windRoseConfig, this.windSpeedConverter);
        const windBarConfigs = this.windRoseConfigFactory.createWindBarConfigs(canvasWidth);
        this.windBarCalculators = [];
        this.windBarCanvases = [];
        for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
            this.windBarCalculators.push(new WindBarCalculator(windBarConfigs[i], this.windSpeedConverter));
            this.windBarCanvases.push(new WindBarCanvas(windBarConfigs[i], this.windSpeedConverter));
        }
    }
    updateWindData() {
        //console.log('updateWindData()');
        this.getHistory().then((history) => {
            const directionData = history[this.cardConfig.windDirectionEntity];
            const firstSpeedData = history[this.cardConfig.windspeedEntities[0].entity];
            const directionSpeedData = new MeasurementMatcher(directionData, firstSpeedData, this.cardConfig.directionSpeedTimeDiff).match(this.cardConfig.matchingStrategy);
            this.windRoseCalculator.clear();
            for (const directionSpeed of directionSpeedData) {
                this.windRoseCalculator.addDataPoint(directionSpeed.direction, directionSpeed.speed);
            }
            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarCalculators[i].addSpeeds(history[this.cardConfig.windspeedEntities[i].entity]
                    .filter((point) => !isNaN(Number(point.s)))
                    .map((point) => point.s));
            }
            this.windRoseData = this.windRoseCalculator.calculate();
            for (let i = 0; i < this.cardConfig.windBarCount(); i++) {
                this.windBarsData[i] = this.windBarCalculators[i].calculate();
            }
            this.requestUpdate();
        });
    }
    getHistory() {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - this.cardConfig.hoursToShow);
        const endTime = new Date();
        const historyMessage = {
            "type": "history/history_during_period",
            "start_time": startTime,
            "end_time": endTime,
            "minimal_response": false,
            "no_attributes": false,
            "entity_ids": this.cardConfig.entities,
            "id": 53
        };
        return this._hass.callWS(historyMessage);
    }
    updateCanvasSize(canvasWidth) {
        // console.log('updateCanvasSize()', canvasWidth);
        this.canvas.width = canvasWidth;
        const windRoseConfig = this.windRoseConfigFactory.createWindRoseConfig(canvasWidth);
        this.windRoseCanvas = new WindRoseCanvas(windRoseConfig, this.windSpeedConverter);
        this.canvas.height = this.windRoseConfigFactory.canvasHeight;
        const windBarConfigs = this.windRoseConfigFactory.createWindBarConfigs(canvasWidth);
        this.windBarCanvases = [];
        for (const windBarConfig of windBarConfigs) {
            this.windBarCanvases.push(new WindBarCanvas(windBarConfig, this.windSpeedConverter));
        }
    }
    drawWindRoseAndBar() {
        var _a;
        // console.log('drawWindRoseAndBar()')
        (_a = this.windRoseCanvas) === null || _a === void 0 ? void 0 : _a.drawWindRose(this.windRoseData, this.canvasContext);
        for (let i = 0; i < this.windBarCanvases.length; i++) {
            this.windBarCanvases[i].drawWindBar(this.windBarsData[i], this.canvasContext);
        }
    }
};
__decorate([
    i('#windRose')
], WindRoseCard.prototype, "canvas", void 0);
__decorate([
    i('.card-content')
], WindRoseCard.prototype, "parentDiv", void 0);
WindRoseCard = __decorate([
    e$1('windrose-card')
], WindRoseCard);

export { CardColors, CardConfigWrapper, ColorUtil, DirectionSpeed, DrawUtil, GlobalConfig, MeasurementMatcher, SpeedRange, SpeedUnit, WindBarCalculator, WindBarCanvas, WindBarConfig, WindBarData, WindDirectionCalculator, WindDirectionConverter, WindDirectionData, WindRoseCalculator, WindRoseCanvas, WindRoseCard, WindRoseCardEditor, WindRoseConfig, WindRoseConfigFactory, WindRoseData, WindSpeedConverter };

today = datetime.datetime.now().date()

name = data.get('name')
type = data.get('type')
sensorName = "sensor.{}_{}".format(type , name.replace(" " , "_"))

dateStr = data.get('date')
dateSplit = dateStr.split("/")

dateDay = int(dateSplit[0])
dateMonth = int(dateSplit[1])
dateYear =  int(dateSplit[2])
date = datetime.date(dateYear , dateMonth , dateDay)

thisYear = today.year
nextOccur = datetime.date(thisYear , dateMonth , dateDay)

numberOfDays = 0
years = int(thisYear) - dateYear

if today < nextOccur:
  numberOfDays = (nextOccur - today).days

elif today > nextOccur:
  if thisYear > dateYear + 1:
    nextOccur = datetime.date(thisYear + 1 , dateMonth , dateDay)
    numberOfDays = (nextOccur - today).days
    years = years + 1
  else:
    nextOccur = datetime.date(dateYear , dateMonth , dateDay)
    numberOfDays = (nextOccur - today).days
    years = years + 1

friendly_name = ''

if type.lower() == 'birthday':
  friendly_name = "{}'s {}".format(name , type)
else:
  friendly_name = "{} {}".format(name , type)

hass.states.set(sensorName , numberOfDays ,
  {
    "icon" : "mdi:calendar-star" ,
    "unit_of_measurement" : "days" ,
    "friendly_name" : friendly_name,
    "nextoccur" : "{}/{}/{}".format(nextOccur.day , nextOccur.month , nextOccur.year) ,
    "years" : years
  }
)

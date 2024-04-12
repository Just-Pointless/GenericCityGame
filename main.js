// VARIABLES
var Money = 0
var Time = 420
var Day = 1
var WeekDay = 6
var YearDay = 6
var TotalTime = 420
var Jobs = {}
var ExtraText = ""
var EndText = ""
var Stats = {"Fatigue": 0, "Health": 100}
var Debt = 10000
var DebtDue = 0
var Tutorials = {}
var Skills = {"Communication": 0, "Foraging": 0, "Science": 0, "English": 0, "Math": 0, "Business": 0, "History": 0, "Fitness": 0, "Technology": 0}
var SkillXp = {"Communication": 0, "Foraging": 0, "Science": 0, "English": 0, "Math": 0, "Business": 0, "History": 0, "Fitness": 0, "Technology": 0}
var Cooldowns = {"Coffee": 0, "EnergyDrink": 0}
var Inventory = {}
const ItemData = {"RedBerry": {"Name": "Red Berries", "Usable": false}, "BlueBerry": {"Name": "Blue Berries", "Usable": false}, "GreenBerry": {"Name": "Green Berries", "Usable": false}, "Moonberry": {"Name": "Moonberries", "Usable": true}}
var InventoryHidden = true
var StatsHidden = true
var SavesHidden = true
var OfficeRank = 0
var OfficePromotionXP = 0
var OfficeRanks = [
    {"Title": "File Sorter", "Pay": 8, "Promotion": 20},
    {"Title": "File Analyzer", "Pay": 10, "Promotion": 30, "Skills": {"Math": 3}},
    {"Title": "Database Analyzer", "Pay": 12, "Promotion": 50, "Skills": {"Math": 4, "Technology": 3}},
    {"Title": "Supervisor", "Pay": 15, "Promotion": 100, "Skills": {"Math": 4, "Technology": 3, "English": 3, "Communication": 6}},
    {"Title": "Assistant Manager", "Pay": 20, "Promotion": 150, "Skills": {"Technology": 5, "English": 4, "Communication": 7}},
    {"Title": "Deputy Manager", "Pay": 23, "Promotion": 200, "Skills": {"English": 5, "Communication": 8, "Business": 4}},
    {"Title": "Manager", "Pay": 27, "Promotion": 10000000, "Skills": {"English": 6, "Communication": 8, "Business": 5}} // Change to 250 when more ranks available
]
var OldScene = ""
var CurrentScene = ""
const CrystalCavesLocations = {"2,2": "{Shop|CrystalCavesShop|0}", "3,3": "{Exit (10m)|CrystalCavesExit|10}"}
const StallSellPrices = {"RedBerry": 1, "BlueBerry": 2, "GreenBerry": 2}
var Secrets = {}
var Enemy = {"Health": 100, "MaxHealth": 100, "Name": "???", "PlayerAction": undefined, "EnemyAction": undefined, "Strength": 1}
const PresetEnemies = {
    "Test": {"MaxHealth": 100, "Name": "Test", "Strength": 1},
    "Thug": {"MaxHealth": 100, "Name": "Thug", "Strength": 1}
}
const EnemyDrops = {"Thug": {"MoneyMin": 20, "MoneyMax": 50}}
var HomeUpgrades = {}
var DailySubs = {}
// Medal stuff later when more content
//var Medals = {"$10": false, "$100": false, "$1000": false}
//var MedalDesc = {"$10": "Get 10 dollars", "$100": "Get 100 dollars", "$1000": "Get 1000 dollars"}

// STAT MENU SETUP
for (var key of Object.keys(Skills)) {
    div = document.createElement("div")
    div.textContent = key + ": " + Skills[key] + " (0 XP)"
    div.className = "PopupText"
    div.id = "STAT_" + key
    document.getElementById("StatItems").appendChild(div)
}

// EXTRA FUNCTIONS
function ChangeTime(amount) {
    if ((Time + amount) > 1440) {
        Time += amount - 1440
        Day += 1
        YearDay += 1
        document.getElementById("STAT_day").textContent = "Day: " + Day
        WeekDay += 1
                    
        if (WeekDay >= 8) {
            DebtDue = DebtScaling[Math.floor(YearDay / 7)]
            WeekDay = 1
        }
        document.getElementById("Day").textContent = "Day: " + Day + " " + GetDayName().substring(0,3)

        for (var key of Object.keys(DailySubs)) {
            if (Money - DailySubs[key] < 0) {
                delete DailySubs[key]
            } else {
                Money -= DailySubs[key]
            }
        }
    } else {
        Time += amount
    }
    TotalTime += amount
    ChangeStat("Health", amount / 60)
    let m = Time % 60
    let h = (Time-m)/60
    document.getElementById("Clock").textContent = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString()
}

function GetTimeName(person) {
    if (Time < 360) {
        return "night"
    } else if (Time < 721) {
        return "morning"
    } else if (Time < 1081) {
        return "afternoon"
    } else if (Time < 1321) {
        return "evening"
    } else if (Time < 1441) {
        if (person == false) {
            return "night"
        } else {
            return "evening"
        }
    } else {
        return "???"
    }
}

function GetDayName() {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][WeekDay - 1] // Yes i know sunday should be first but uh it makes weekend checks shorter
}


function ChangeStat(stat, amount) {
    if (stat == "Fatigue") {
        if (Stats['Fatigue'] + amount >= 0) {
            Stats['Fatigue'] += amount
        } else {
            Stats['Fatigue'] = 0
        }
        document.getElementById("SidebarFatigue").textContent = "Fatigue: " + Math.round(Stats['Fatigue']) + "/100"
        if (Stats['Fatigue'] > 100) {
            document.getElementById("SidebarFatigue").style.color = "Red"
        } else {
            document.getElementById("SidebarFatigue").style.color = "White"
        }
    } else if (stat == "Health") {
        if (Stats['Health'] + amount <= 100) {
            Stats['Health'] += amount
        } else {
            Stats['Health'] = 100
        }
        if (Stats['Health'] <= 0) {
            document.getElementById("SidebarHealth").style.color = "Red"
        } else {
            document.getElementById("SidebarHealth").style.color = "White"
        }
        document.getElementById("SidebarHealth").textContent = "Health: " + Math.round(Stats['Health']) + "/100"
    }
}

function ChangeXp(skill, amount) {
    if (SkillXp[skill] + amount >= Skills[skill] * 20 + 20) {
        SkillXp[skill] += amount - (Skills[skill] * 20 + 20)
        Skills[skill] += 1
        EndText = "\n\n" + ColorGen("21a8d1", skill + " increased to level " + Skills[skill])
    } else {
        SkillXp[skill] += amount
    }
    document.getElementById("STAT_" + skill).textContent = skill + ": " + Skills[skill] + " (" + SkillXp[skill] + " XP)"
}

function ColorGen(hex, text) {
    return "<span style=\"color: #" + hex + "\">" + text + "</span>"
}

function BoldGen(text) {
    return "<b>" + text + "</b>"
}

function GetRng() {
    return Math.floor(Math.random() * 1000);
}

function RandomNumber(max) {
    return Math.ceil(Math.random() * max);
}

function RandomNumberFromMinMax(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

function ChangeInventory(item, increment) {
    if (Inventory[item]) {
        Inventory[item] += increment
        document.getElementById("INVENTORYITEM_" + item).textContent = ItemData[item]['Name'] + ": " + Inventory[item]
    } else {
        Inventory[item] = increment
        div = document.createElement("div")
        div.textContent = ItemData[item]['Name'] + ": " + Inventory[item]
        div.className = "PopupItems"
        div.id = "INVENTORYITEM_" + item
        document.getElementById("InventoryItems").appendChild(div)
        
    }

    console.log(Inventory)
}

function GetNextClass() {
    if (Time < 585) {
        return "Science"
    } else if (Time < 635) {
        return "English"
    } else if (Time < 715) {
        return "Math"
    } else if (Time < 765) {
        return "Business"
    } else if (Time < 845) {
        return "History"
    } else if (Time < 895) {
        return "Physical Education"
    } else {
        return "Nothing"
    }
}

function TextLoader(text) {
    var Main = document.getElementById("Main")
    var re = new RegExp("\\{([^|{}]+)\\|([^|{}]+)\\|([0-9]+)\\|?([^|{}(]+)?\\(?([^(){}|]+)?\\)?\\}", "g")
    var re2 = new RegExp("{[^}]{1,}}", "g")
    var SplitText = text.split(re2)
    var SplitLinks = []
    do {
        m = re.exec(text)
        if (m) {
            SplitLinks.push(m)
        }
    } while (m)
    //console.log(SplitLinks)
    SplitText.forEach(function (item, num) {
        //console.log(item)
        div = document.createElement("div")
        div.innerHTML = item
        div.style.color = "white"
        div.className = "MainText"
        document.getElementById("Main").appendChild(div)
        if (num <= SplitLinks.length - 1) {
            button = document.createElement("button")
            console.log(SplitLinks[num][1])
            button.innerHTML = SplitLinks[num][1]
            button.className = "MainLink"
            button.id = "Button" + num
            button.addEventListener("click", function() {
                ChangeTime(Number(SplitLinks[num][3]))
                if (SplitLinks[num][4]) {
                    if (SplitLinks[num][5]) {
                        if (SplitLinks[num][5].includes(",")) {
                            scenefunctions[SplitLinks[num][4]](SplitLinks[num][5].split(","))
                        } else {
                            scenefunctions[SplitLinks[num][4]](SplitLinks[num][5])
                        }
                    } else {
                        scenefunctions[SplitLinks[num][4]]()  
                    }
                }
                SceneManager(SplitLinks[num][2])
                document.getElementById("MainTransition").style.zIndex = 2
                document.getElementById("MainTransition").style.opacity = 0
                setTimeout(function() {
                    document.getElementById("MainTransition").style.zIndex = 0
                    document.getElementById("MainTransition").style.opacity = 1
                }, 300)
            })
            document.getElementById("Main").appendChild(button)
        }
    })
}

function NumberSuffix(num) {
    let j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) {
        return num + "st";
    }
    if (j === 2 && k !== 12) {
        return num + "nd";
    }
    if (j === 3 && k !== 13) {
        return num + "rd";
    }
    return num + "th";
}

function InfoText(InfoType) {
    if (InfoType == "Office") {
        let CurRank = OfficeRanks[OfficeRank]
        return "Job Stats:\n - Title: " + CurRank['Title'] + "\n - Pay Per Hour: " + ColorGen("006400", "$" + CurRank["Pay"]) + "\n - Promotion: " + OfficePromotionXP + "/" + CurRank['Promotion']
    }
}

function GetSave() {
    let SaveTable = {}
    SaveTable['Money'] = Money
    SaveTable['Time'] = Time
    SaveTable['Day'] = Day
    SaveTable['WeekDay'] = WeekDay
    SaveTable['YearDay'] = YearDay
    SaveTable['TotalTime'] = TotalTime
    SaveTable['Jobs'] = Jobs
    SaveTable['Stats'] = Stats
    SaveTable['Debt'] = Debt
    SaveTable['DebtDue'] = DebtDue
    SaveTable['Tutorials'] = Tutorials
    SaveTable['Skills'] = Skills
    SaveTable['SkillXp'] = SkillXp
    SaveTable['Cooldowns'] = Cooldowns
    SaveTable['Inventory'] = Inventory
    SaveTable['OfficeRank'] = OfficeRank
    SaveTable['OfficePromotionXP'] = OfficePromotionXP
    SaveTable['OldScene'] = OldScene
    SaveTable['CurrentScene'] = CurrentScene
    document.getElementById("SaveText").value = btoa(JSON.stringify(SaveTable))
}

function LoadSave() {
    let SaveTable = JSON.parse(atob(document.getElementById("SaveText").value))
    Money = SaveTable['Money']
    Time = SaveTable['Time']
    Day = SaveTable['Day']
    WeekDay = SaveTable['WeekDay']
    YearDay = SaveTable['YearDay']
    TotalTime = SaveTable['TotalTime']
    Jobs = SaveTable['Jobs']
    Stats = SaveTable['Stats']
    Debt = SaveTable['Debt']
    DebtDue = SaveTable['DebtDue']
    Tutorials = SaveTable['Tutorials']
    Skills = SaveTable['Skills']
    SkillXp = SaveTable['SkillXp']
    Cooldowns = SaveTable['Cooldowns']
    Inventory = SaveTable['Inventory']
    OfficeRank = SaveTable['OfficeRank']
    OfficePromotionXP = SaveTable['OfficePromotionXP']
    OldScene = SaveTable['OldScene']
    CurrentScene = SaveTable['CurrentScene']
    document.getElementById("STAT_day").textContent = "Day: " + Day
    document.getElementById("Day").textContent = "Day: " + Day + " " + GetDayName().substring(0,3)
    SceneManager(CurrentScene)
    SavesHidden = true
    $("#Saves").hide()
}

function SkillCheck(SkillTable) {
    var Missing = []
    for (var key of Object.keys(SkillTable)) {
        if (Skills[key] < SkillTable[key]) {
            Missing.push(key)
        }
    }
    return Missing
}

function MazeGen(PlayerX, PlayerY, X, Y, coordlist) { // Not really a maze generator as it just makes a small area but i just called the function that cuz i didnt have anything else to name it
    if (coordlist[PlayerX + "," + PlayerY] != undefined) {
        var CoordInfo = coordlist[PlayerX + "," + PlayerY]
    } else {
        var CoordInfo = false
    }
    if (PlayerX == 1) {
        if (PlayerY == 1) {
            return [CoordInfo, false, true, true, false] // North, South, East, West
        } else if (PlayerY == Y) {
            return [CoordInfo, true, false, true, false]
        } else {
            return [CoordInfo, true, true, true, false]
        }
    } else if (PlayerX == X) {
        if (PlayerY == 1) {
            return [CoordInfo, false, true, false, true]
        } else if (PlayerY == Y) {
            return [CoordInfo, true, false, false, true]
        } else {
            return [CoordInfo, true, true, false, true]
        }
    } else {
        if (PlayerY == 1) {
            return [CoordInfo, false, true, true, true]
        } else if (PlayerY == Y) {
            return [CoordInfo, true, false, true, true]
        } else {
            return [CoordInfo, true, true, true, true]
        } 
    }
}

function SetupEnemy(health, maxhealth, name, strength) {
   Enemy = {"Health": health, "MaxHealth": maxhealth, "Name": name, "PlayerAction": undefined, "EnemyAction": undefined, "Strength": strength}
}

function SetupPresetEnemy(preset) {
    SetupEnemy(1,1,"???",1)
    Enemy['Health'] = PresetEnemies[preset]['MaxHealth']
    Enemy['MaxHealth'] = PresetEnemies[preset]['MaxHealth']
    Enemy['Name'] = PresetEnemies[preset]['Name']
    Enemy['Strength'] = PresetEnemies[preset]['Strength']
    
}

function LoadCombatButtons(argstring) {
    let CombatStr = "\n{Punch|Empty|2|CombatManager(" + argstring + ",Punch)}\n{Kick|Empty|2|CombatManager(" + argstring + ",Kick)}"
    EndText += CombatStr
}

// SCENES
class scenes {
    Test() {
        return "hi this is a test scene with 2 buttons\n{button1|Menu|0}\n{button2|invalid|0}\nok cool bye"
    }
    
    Menu() {
        return "Menu\n{Start|Tutorial|0}\n\n{About|About|0}"
    }
    
    About() {
        return "I made this game cuz i kinda liked visual novels but didn't have the skill to be able to draw stuff so yea this game is basically an interactive novel (but kinda bad) instead\n\n{Return|Menu|0}"
    }
    
    Tutorial() {
        return "Welcome to Generic City Game.\nThere is no predefined objective yet so you can try to earn as much money as possible.\n\nthe duration of each action is usually shown in brackets after the blue text.\ne.g. (30m) (1h 15m)\n\nThats about it press the blue text below to continue.\n{Next|Home|0}"
    }
    
    Home() {
        let Temp1 = ""
        if (HomeUpgrades['Laptop'] == true) {
            Temp1 = "\n{Laptop|HomeLaptop|0}"
        }
        return "You are in your apartment its currently " + GetDayName() + " " + GetTimeName(false) + ".\n\n{Sleep|Sleep|0}" + Temp1 + "\n\n{Leave (1m)|ApartmentHall|1}"
    }
    
    HomeLaptop() { // TODO: Add wifi and an option to browse the internet
        let Temp1 = "You open your laptop and turn it on. "
        if (CurrentScene == "HomeLaptopBrowseMenu") {
            Temp1 = ""
        }
        if (DailySubs['Wifi'] == true) {
            return Temp1 + "What would you like to do?\n\n{Browse the internet|HomeLaptopBrowseMenu|0}\n\n{Turn off|Home|0}"
        } else {
            return Temp1 + "What would you like to do?\n\n" + ColorGen("ffa500", "You need a wifi subscription to browse the internet") + "\n\n{Turn off|Home|0}"    
        }
    }

    HomeLaptopBrowseMenu() {
        return "{News (10m)|HomeLaptop|10|NewsManager(Digital)}\n\n{Turn off|Home|0}"
    }

    ApartmentHall() {
        if (Tutorials['Banker'] == true) {
            if (Day >= 3) {
                return "You are in the hall of your apartment block. One of the lights is constantly flickering and some of the paint on the walls has peeled off.\n\n{Your apartment (1m)|Home|1}\n{Check mailbox (2m)|ApartmentHallMailbox|2}\n\n{Go outside (1m)|MeadowbrookStreet|1}"
            } else {
                return "You are in the hall of your apartment block. One of the lights is constantly flickering and some of the paint on the walls has peeled off.\n\n{Your apartment (1m)|Home|1}\n\n{Go outside (1m)|MeadowbrookStreet|1}"
            }
        } else {
            Tutorials['Banker'] = true
            return "As you step out of your apartment a skinny man with a black bowler hat approaches you.\n\n\"Greetings, we've met before. I'm here to remind you about your outstanding balance of $10000, with a payment of $100 due this week. If you've forgotten, our bank is at " + ColorGen("ffd700", "Crestwood Street") + ", You can visit at any time to inquire about the remaining amount you owe.\"\n\n{Next|ApartmentHall|0}"
        }
    }
    
    ApartmentHallMailbox() {
        if (Tutorials['School'] == true) {
            return "Your mailbox is empty.\n\n{Back|ApartmentHall|0}"
        } else {
            return "You have a letter from your school\n\n{Read (10m)|SchoolLetter1|10}\n\n{Back|ApartmentHall|0}"
        }
    }
    
    SchoolLetter1() {
        Tutorials['School'] = true
        return "You open the letter and read: \"We hope this letter finds you well. This is a friendly reminder that the new academic term at Oxford School begins tomorrow.\n\nDirections from your home on Meadowbrook Street to our campus are listed below.\nMeadowbrook Street -> Lunar Road -> Oxford Street\n\nPlease do not hesitate to contact us if you have any questions or need further assistance.\"\n\n{Next|ApartmentHall|0}"
    }
    
    MeadowbrookStreet() {
        let Temp1 = ""
        if (Time > 360 && Time < 900 && Day >= 2) {
            Temp1 = "{Buy newspaper ($2)|Empty|5|NewsManager(Paper)}\n"
        }
        return "You are on Meadowbrook Street, a slightly poorer part of town. There's very few cars on this road. You hear the distant hum of traffic.\n\n{Apartment block (1m)|ApartmentHall|1}\n" + Temp1 + "{Convenience Store (1m)|ConvenienceStore|1}\n\n{Crestwood Street (5m)|CrestwoodStreet|5}\n{Lunar Road (5m)|LunarRoad|5}"
    }
    
    ConvenienceStore() {
        if (Jobs['ConvenienceStore'] == true) {
            if (Stats['Fatigue'] < 90) {
                return "You are in the convenience store, it has shelves stocked with cheap items\n\n{Work (1h)|ConvenienceStore|60|ConvenienceStoreWork}\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
            } else {
                return "You are in the convenience store, it has shelves stocked with cheap items\n\n" + ColorGen("d90202", "You are too tired to work") + "\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
            }
        } else {
            return "You are in the convenience store, it has shelves stocked with cheap items\n\n{Inquire about work (5m)|ConvenienceStoreWO1|5}\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
        }
    }
    
    ConvenienceStoreWO1() {
        return "You patiently wait in the convenience store for five minutes until the manager arrives.\nHe's willing to give you a job on the spot as they are heavily understaffed.\nThe pay is $3/hr which is definitely below minimum wage but atleast it's something.\n\n{Accept (10m)|ConvenienceStoreWO2|10|ConvenienceStoreWO}\n{Refuse|ConvenienceStore|0}"
    }
    
    ConvenienceStoreWO2() {
        return "You listen carefully as he explains what to do\n{Next|ConvenienceStore|0}"
    }
    
    Sleep() {
        return "{Sleep for 1 hour|Home|60|Sleep(1)}\n\n{Sleep for 2 hours|Home|120|Sleep(2)}\n\n{Sleep for 3 hours|Home|180|Sleep(3)}\n\n{Sleep for 4 hours|Home|240|Sleep(4)}\n\n{Sleep for 6 hours|Home|360|Sleep(6)}\n\n{Sleep for 8 hours|Home|480|Sleep(8)}\n\n{Sleep for 10 hours|Home|600|Sleep(10)}\n\n{Cancel|Home|0}"
    }
    
    CrestwoodStreet() {
        return "You are on Crestwood street, a more wealthy part of town with tall offices and banks. As expected there's the constant sound of honking from cars stuck in traffic.\n\n{Bank (1m)|Bank|1}\n{Office (1m)|Office|1}\n{Fast Food Restaurant (2m)|FastFoodRestaurant|2}\n{Technology Store (2m)|TechnologyStore|2}\n\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}\n{Market Street (10m)|MarketStreet|10}"
    }
    
    Bank() {
        if (DebtDue == 0) {
            if (Day <= 2) {
                return "You are in the bank. It's well lit with luxurious red carpets and a crystal chandelier\n\nDebt: " + ColorGen("006400", "$" + Debt) + "\n Due next week: " + ColorGen("006400", "$100") + "\n\n{Leave (1m)|CrestwoodStreet|1}"
            } else {
                return "You are in the bank. It's well lit with luxurious red carpets and a crystal chandelier\n\nDebt: " + ColorGen("006400", "$" + Debt) + "\n Due this week: " + ColorGen("006400", "$" + DebtDue) + "\n\n" + ColorGen("2eba04", "Debt paid for this week") + "\n\n{Leave (1m)|CrestwoodStreet|1}"
            }
        } else {
            return "You are in the bank. It's well lit with luxurious red carpets and a crystal chandelier\n\nDebt: " + ColorGen("006400", "$" + Debt) + "\n Due this week: " + ColorGen("006400", "$" + DebtDue) + "\n\n{Pay debt (15m)|BankPayDebt|15}\n\n{Leave (1m)|CrestwoodStreet|1}"
        }
    }
    
    BankPayDebt() {
        if (Money >= DebtDue) {
            return "Good " + GetTimeName(true) + " your here to pay off your debt? We only accept payment for the full week.\n\n{Pay (10m)|Bank|10|DebtPay}\n{Leave|Bank|1}"
        } else {
            return "Good " + GetTimeName(true) + " your here to pay off your debt? We only accept payment for the full week.\n\n" + ColorGen("d90202", "Not enough money") + "\n{Leave|Bank|1}"
        }
    }
    
    Office() {
        if (Time <= 570 && Time >= 510 && Jobs['Office'] == true && WeekDay < 6) {
            return "You are in the office. It's well lit with a marble floor. You are unable to tell what company this office is owned by.\n\n{Work (8h)|OfficeWorkEntry|0}\n{Receptionist (2m)|OfficeReceptionist|2}\n\n{Leave (1m)|CrestwoodStreet|1}"    
        } else {
            return "You are in the office. It's well lit with a marble floor. You are unable to tell what company this office is owned by.\n\n{Receptionist (2m)|OfficeReceptionist|2}\n\n{Leave (1m)|CrestwoodStreet|1}"
        }
    }
    
    OfficeReceptionist() {
        if (Jobs['Office'] == undefined) {
            if (Skills['Communication'] < 5 && Skills['Math'] < 2) {
                return "\"Good " + GetTimeName(true) + ", how may I assist you today?\"\n\n" + ColorGen("ffa500", "Requires: Communication 5 and Math 2") + "\n\n{Leave|Office|0}"
            } else {
                return "\"Good " + GetTimeName(true) + ", how may I assist you today?\"\n\n{Inquire about work (1m)|OfficeWO1|1}\n\n{Leave|Office|0}" 
            }
        } else {
            return "\"Good " + GetTimeName(true) + ", how may I assist you today?\"\n\n{Leave|Office|0}" 
        }
    }
    
    OfficeWO1() {
        return "The receptionist gives you a few simple tasks to complete to test your ability.\n\n{Next (20m)|OfficeWO2|20}"
    }
    
    OfficeWO2() {
        Jobs['Office'] = true
        return "Upon completion she gives you some infomation about your job. \"You will be sorting files for our company. Note that you can only begin working at 9am on weekdays\"\n\n{Next|Office|0}"
    }
    
    OfficeWorkEntry() {
        if (OfficePromotionXP < OfficeRanks[OfficeRank]['Promotion']) {
            return "Since your desk is on the 3rd floor you take the staircase to get there as its more efficient.\n\n{Next|OfficeWorkMid|0|OfficeWorkManager(1)}"
        } else {
            return "Since your desk is on the 3rd floor you take the staircase to get there as its more efficient.\n\n{Request Promotion|OfficePromotion|0}\n\n{Next|OfficeWorkMid|0|OfficeWorkManager(1)}"
        }
    }

    OfficeWorkMid() {
        return ""
    }

    OfficeWorkEnd() {
        OfficePromotionXP += 8
        Money += 8 * OfficeRanks[OfficeRank]['Pay']
        if (OfficeRanks[OfficeRank]['Promotion'] <= OfficePromotionXP) {
            EndText = "\n\nYou can request for a promotion the next time you work if you have the required skills"
        }
        return "You finish your 8 hour shift and head down to the first floor. It is extremely crowded with thousands of employees leaving the building. You got paid " + ColorGen("006400", "$" + 8 * OfficeRanks[OfficeRank]['Pay']) + " upon leaving the building.\n\n" + InfoText("Office") + "\n\n{Next|CrestwoodStreet|0}"
    }
    
    OfficePromotion() {
        if (SkillCheck(OfficeRanks[OfficeRank + 1]['Skills']).length == 0) {
            OfficePromotionXP = 0
            OfficeRank += 1
            return "You head towards a futuristic looking device that tracks your hours worked and your performance. You have automatically been promoted to \"" + OfficeRanks[OfficeRank]['Title'] + "\". You can begin working now\n\n{Next|OfficeWorkMid|0|OfficeWorkManager(1)}"
        } else {
            var SkillsRequired = SkillCheck(OfficeRanks[OfficeRank + 1]['Skills'])
            var RequiredString = ""
            SkillsRequired.forEach(function(value) {
                RequiredString += "\n - " + value + " " + OfficeRanks[OfficeRank + 1]['Skills'][value]
            })
            return "You head towards a futuristic looking device that tracks your hours worked and your performance. You do not have the skills required to be promoted.\n\nRequired:" + RequiredString + "\n\n{Next|OfficeWorkMid|0|OfficeWorkManager(1)}"
        }
    }
    
    FastFoodRestaurant() {
        if (Jobs['FastFood'] == true) {
            if (Stats['Fatigue'] < 90) {
                return "You are in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n{Work (1h)|FastFoodRestaurant|60|FastFoodRestaurantWork}\n\n{Leave (1m)|CrestwoodStreet|1}"
            } else {
                return "You are in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n" + ColorGen("d90202", "You are too tired to work") + "\n\n{Leave (1m)|CrestwoodStreet|1}"
            }
        }
        return "You are in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n{Inquire about work (7m)|FastFoodRestaurantWO1|7}\n\n{Leave (1m)|CrestwoodStreet|1}"
    }
    
    FastFoodRestaurantWO1() {
        return "A man in a black suit walks out the back door and heads towards you \n\"You are looking for work right? Follow me\"\n\n{Next|FastFoodRestaurantWO2|0}"
    }
    
    FastFoodRestaurantWO2() {
        if (Skills['Communication'] < 3) {
            return "After entering the room he asks you a few questions\n\n\"Are you good at communicating with customers?\"\n\n" + ColorGen("ffa500", "Requires: Communication 3") + "\n{No|FastFoodRestaurantWO3B|0}"
        } else {
            return "After entering the room he asks you a few questions\n\n\"Are you good at communicating with customers?\"\n\n{Yes|FastFoodRestaurantWO3A|0}\n{No|FastFoodRestaurantWO3B|0}"
        }
        
    }
    
    FastFoodRestaurantWO3A() {
        Jobs['FastFood'] = true
        return "\"Great, you can begin working at any time, your pay starts at $5 per hour. You also get to keep any tips that you recieve\"\n\n{Continue|FastFoodRestaurant|0}"
    }
    
    FastFoodRestaurantWO3B() {
        return "\"Well thats unfortunate, but don't worry you can always come back at any time after you improved your skills\"\n\n{Continue|FastFoodRestaurant|0}"
    }
    
    TechnologyStore() {
        let Temp1 = ""
        if (HomeUpgrades['Laptop'] == undefined) {
            Temp1 = "{Buy Laptop ($300)|TechnologyStore|1|TechnologyStoreBuy(Laptop)}\n\n"
        }
        return "You are in the technology store. There are expensive laptops and phones being displayed on the walls.\n\n" + Temp1 + "{Leave (2m)|CrestwoodStreet|2}"
    }

    LunarRoad() {
        if (Time < 60) {
            return "You are on Lunar Road. There appears to be nothing besides a forest nearby. You notice a faint beam of light pointing towards a manhole cover\n\n{Walk towards the beam of light (1m)|LunarRoadManholeCover1|1}\n{Forest (10m)|ForestLayer1|10}\n\n{Oxford Road (5m)|OxfordStreet|5}\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}"
        } else {
            return "You are on Lunar Road. There appears to be nothing besides a forest nearby.\n\n{Forest (10m)|ForestLayer1|10}\n\n{Oxford Road (5m)|OxfordStreet|5}\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}"
        }
    }
    
    LunarRoadManholeCover1() {
        return "You remove the manhole cover. There appears to be no ladder.\n\n{Enter|CrystalCaves|0|CrystalCavesManager(1,1)}\n\n{Go back|LunarRoad|0}"
    }
    
    CrystalCaves() {
        return ""
    }
    
    CrystalCavesShop() {
        return "You are in a small shop selling odd products. The shop does not have any walls. Products are stored on old wooden tables.\n\n{Moonberry ($50)|CrystalCavesShop|0|CrystalCavesStoreBuy(Moonberry)}\n\n{Leave|CrystalCaves|0|CrystalCavesManager(2,2)}"
    }
    
    CrystalCavesExit() {
        return "You walk up a rocky slope until you see an exit.\n\n{Next|ForestLayer3|0}"
    }
    
    ForestLayer1() {
        if (Stats['Fatigue'] < 100) {
            return "You are near the enterance of the forest. The trees stand tall but their spacing allows glimpses of sunlight to filter through.\n\n{Look for berries (20m)|ForestLayer1|20|ForestGather(1)}\n\n{Walk towards the center (20m)|ForestLayer2|20}\n{Lunar Road (5m)|LunarRoad|5}"
        } else {
            return "You are near the enterance of the forest. The trees stand tall but their spacing allows glimpses of sunlight to filter through\n\n" + ColorGen("d90202", "You are too tired to look for berries") + "\n\n{Walk towards the center (20m)|ForestLayer2|20}\n{Lunar Road (5m)|LunarRoad|5}"
        }
    }

    ForestLayer2() {
        if (Skills['Foraging'] >= 4) {
            if (Stats['Fatigue'] < 100) {
                return "You are in the forest. Trees block the sunlight making the area darker.\n\n{Look for berries (20m)|ForestLayer2|20|ForestGather(2)}\n\n{Walk towards the exit (20m)|ForestLayer1|20\n{Walk towards the center (20m)|ForestLayer2|20}"
            } else {
                return "You are in the forest. Trees block the sunlight making the area darker.\n\n" + ColorGen("d90202", "You are too tired to look for berries") + "\n\n{Walk towards the exit (20m)|ForestLayer1|20\n{Walk towards the center (20m)|ForestLayer2|20}"
            }
        } else {
            return "You are in the forest. Trees block the sunlight making the area darker.\n\n" + ColorGen("ffa500", "Requires: Foraging 4") + "\n\n{Walk towards the exit (20m)|ForestLayer1|20}\n{Walk towards the center (20m)|ForestLayer3|20}"
        }
    }
    
    ForestLayer3() {
        let Temp1 = ""
        let Temp2 = ""
        if (Secrets['Ruins'] == true) {
            Temp1 = "{Ruins (10m)|ForestRuins|10}\n"
        }
        if (Secrets['BlackwoodStreet'] == true) {
            Temp2 = "{Blackwood Street (5m)|BlackwoodStreet|5}\n"
        }
        if (Skills['Foraging'] >= 7) {
            if (Stats['Fatigue'] < 100) {
                return "You are near the center of the forest. There are trees everywhere. They block most of the sunlight making it hard to see\n\n{Explore (20m)|ForestLayer3|20|ForestGather(3)}\n\n" + Temp1 + Temp2 + "{Walk towards the exit (20m)|ForestLayer2|20}"
            } else {
                return "You are near the center of the forest. There are trees everywhere. They block most of the sunlight making it hard to see.\n\n" + ColorGen("d90202", "You are too tired to explore") + "\n\n" + Temp1 + Temp2 + "{Walk towards the exit (20m)|ForestLayer2|20}"
            }
        } else {
            return "You are near the center of the forest. There are trees everywhere. They block most of the sunlight making it hard to see.\n\n" + ColorGen("ffa500", "Requires: Foraging 7") + "\n\n" + Temp1 + Temp2 + "{Walk towards the exit (20m)|ForestLayer2|20}"
        }
    }

    ForestRuins() {
        if (Stats['Fatigue'] < 100) {
            return "You are near the ancient ruins. It does not look like these have been discovered yet.\n\n{Explore (20m)|ForestRuins|20|ForestRuinsManager(Explore)}\n\n{Leave (10m)|ForestLayer3|10}"
        } else {
            return "You are near the ancient ruins. It does not look like these have been discovered yet.\n\n" + ColorGen("d90202", "You are too tired to explore") + "\n\n{Leave (10m)|ForestLayer3|10}"
        }
    }

    BlackwoodStreet() {
        let rng = GetRng()
        if (rng < 100) {
            return "While walking on Blackwood Street a man attacks you.\n\n{Next|Empty|0|CombatManager(BlackwoodStreet,Thug)}"
        }
        return "You are on Blackwood Street. Most of the buildings are in bad condition. It looks like a place with high criminal activity.\n\n{Forest (5m)|ForestLayer3|5}"
    }

    OxfordStreet() {
        return "You are on Oxford Street. There are a few students walking around\n\n{School (1m)|SchoolYard|1}\n\n{Lunar Road (5m)|LunarRoad|5}"
    }
    
    SchoolYard() {
        if (Day < 2 || Time < 480 || Time > 960) {
            return "The school gates are locked. You could probably break in if you had the required skills\n\n{Leave (1m)|OxfordStreet|1}"
        } else {
            return "You are in the school courtyard, it serves as a hub for social interaction.\n\n{Enter the school (3m)|SchoolFloor1|3}\n\n{Leave (3m)|OxfordStreet|3}"
        }
    }
    
    SchoolFloor1() {
        let NextClass = GetNextClass()
        if (Time >= 765 && Time < 795) {
            return "You are inside the school. It's heavily crowded. You have " + NextClass + " next\n\n{" + ColorGen("91bdff", "Canteen (3m)") + "|SchoolCanteen|3}\n\n{Science Classroom (2m)|SchoolScienceClassroom|2}\n{English Classroom (2m)|SchoolEnglishClassroom|2}\n{Math Classroom (2m)|SchoolMathClassroom|2}\n{Business Classroom (2m)|SchoolBusinessClassroom|2}\n{History Classroom (2m)|SchoolHistoryClassroom|2}\n{Physical Education Classroom (2m)|SchoolPEClassroom|2}\n\n{Go upstairs (3m)|SchoolFloor2|3}\n{School courtyard (3m)|SchoolYard|3}"
        } else {
            return "You are inside the school. It's heavily crowded. You have " + NextClass + " next\n\n{Canteen (3m)|SchoolCanteen|3}\n\n{Science Classroom (2m)|SchoolScienceClassroom|2}\n{English Classroom (2m)|SchoolEnglishClassroom|2}\n{Math Classroom (2m)|SchoolMathClassroom|2}\n{Business Classroom (2m)|SchoolBusinessClassroom|2}\n{History Classroom (2m)|SchoolHistoryClassroom|2}\n{Physical Education Classroom (2m)|SchoolPEClassroom|2}\n\n{Go upstairs (3m)|SchoolFloor2|3}\n{School courtyard (3m)|SchoolYard|3}"
        }
    }

    SchoolFloor2() {
        let NextClass = GetNextClass()
        return "You are on the second floor of your school. You can take extra classes here after school. You have " + NextClass + " next\n\n{Technology Classroom (2m)|SchoolTechnologyClassroom|2}\n\n{Go downstairs (3m)|SchoolFloor1|3}"
    }
    
    SchoolCanteen() {
        return "You are in the canteen.\n\n{Rest (25m)|SchoolCanteen|25}\n\n{Leave (3m)|SchoolFloor1|3}"
    }
    
    SchoolScienceClassroom() {
        if (Time < 550 && Time > 535) {
            return "You are in the science classroom. It has slightly damaged lab equipment and walls filled with posters illustrating scientific concepts\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Science,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(Science,Daydream)}"
        } else {
            return "The door for the science classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }
    
    SchoolEnglishClassroom() {
        if (Time < 600 && Time > 585) {
            return "You are in the english classroom. Every table in this classroom contains a reading lamp.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(English,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(English,Daydream)}"
        } else {
            return "The door for the english classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }
    
    SchoolMathClassroom() {
        if (Time < 680 && Time > 665) {
            return "You are in the math classroom. There's a large whiteboard in the front of the room filled with complex equasions.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Math,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(Math,Daydream)}"
        } else {
            return "The door for the math classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }
    
    SchoolBusinessClassroom() {
        if (Time < 730 && Time > 715) {
            return "You are in the business classroom. There's multiple graphs on the wall that provides examples of a market.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Business,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(Business,Daydream)}"
        } else {
            return "The door for the business classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }
    
    SchoolHistoryClassroom() {
        if (Time < 810 && Time > 795) {
            return "You are in the history classroom. It contains multiple maps and timelines of important events in history.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(History,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(History,Daydream)}"
        } else {
            return "The door for the history classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }
    
    SchoolPEClassroom() {
        if (Time < 860 && Time > 845) {
            return "You are in the physical education classroom. It's slightly bigger than the other classrooms as extra space is needed for the training equipment.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(PE,Study)}\n{Daydream|SchoolFloor1|45|ClassManager(PE,Daydream)}"
        } else {
            return "The door for the physical education classroom is currently locked\n\n{Back|SchoolFloor1|0}"
        }
    }

    SchoolTechnologyClassroom() {
        if (Time < 910 && Time > 895) {
            return "You are in the technology classroom. It is filled with computers and cables.\n\nWhat would you like to do?\n\n{Study|SchoolFloor2|45|ClassManager(Technology,Study)}"
        } else {
            return "The door for the technology classroom is currently locked\n\n{Back|SchoolFloor2|0}"
        }
    }
    
    MarketStreet() {
        return "You are on Market Street. You can sell items in your inventory here.\n\n{Fruit Buyer (2m)|MarketStreetFruitBuyer|2|StallLoader(MarketStreetFruitBuyer)}\n\n{Shoreline Street (5m)|ShorelineStreet|5}\n{Maple Street (5m)|MapleStreet|5}\n{Crestwood Street (10m)|CrestwoodStreet|10}"
    }

    MarketStreetFruitBuyer() {
        return "You head towards a stall that specialises in buying and selling fruits.\n\n"
    }

    StallSell() {
        return ""
    }
    
    ShorelineStreet() {
        return "You are on Shoreline Street. You can access the beach from here\n\n{Beach (5m)|Beach|5}\n{Wifi shop (2m)|WifiShop|2}\n\n{Market Street (5m)|MarketStreet|5}"
    }
    
    Beach() {
        return "You are on the beach. (Better description later)\n\n{Shoreline Street (5m)|ShorelineStreet|5}" // TODO: better description
    }

    WifiShop() {
        return "You are in a long building with filled with people lining up to access a kiosk.\n\n{Kiosk (10m)|WifiShopKiosk|10}\n\n{Leave (2m)|ShorelineStreet|2}"
    }

    WifiShopKiosk() {
        if (DailySubs['Wifi'] == true) {
            return "{Cancel subscription|WifiShop|1|BuyWifiSub(Cancel)}\n\n{Leave|WifiShop|0}"
        } else {
            return "{Buy wifi subscription ($10/day)|WifiShop|1|BuyWifiSub(Buy)}\n\n{Leave|WifiShop|0}"
        }
    }

    Empty() { // Special scene that returns nothing (usually controlled by scene functions)
       return "" 
    }

    MapleStreet() {
        return "You are on Maple Street. You can access the hospital from here.\n\n{Hospital (2m)|Hospital|2}\n\n{Market Street (5m)|MarketStreet|5}"
    }

    Hospital() {
        return "You are in the hospital. Multiple doctors are running between rooms.\n\n{Leave (2m)|MapleStreet|2}"
    }

    HospitalInRoom() {
        return "You wake up on a bed in a hospital. There is a doctor talking to another person but you can not hear them. After awhile you are released from the hospital. Thankfully there are no fees.\n\n{Next|Hospital|0}"
    }
    
}
class SceneFunctions {
    ConvenienceStoreWO() {
        Jobs['ConvenienceStore'] = true
        console.log(Jobs)
    }
    
    ConvenienceStoreWork() {
        let rng = GetRng()
        Money += 3
        ChangeStat("Fatigue", 7)
        ChangeXp("Communication", 3)
        if (rng < 100) {
            ChangeStat("Fatigue", 5)
            ExtraText = "The convenience store suddenly had a spike in customers\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "+12 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
        } else if (rng < 150) {
            ChangeStat("Health", -4)
            ExtraText = "While stocking the shelves you slip on a puddle of water\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "-4 Health") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
        } else {
            ExtraText = "Nothing interesting happened.\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "+7 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
        }
    }
    
    ConvenienceStoreBuy(item) {
        if (item == "Coffee") {
            if (Money >= 10) {
                if (Cooldowns['Coffee'] <= TotalTime) {
                    Cooldowns['Coffee'] = TotalTime + 2400
                    ChangeStat("Fatigue", -25)
                    ExtraText = "You bought coffee for " + ColorGen("006400", "$10") + "\n" + ColorGen("2eba04", " -25 Fatigue\n\n")
                } else {
                    ExtraText = "You bought coffee for " + ColorGen("006400", "$10") + ColorGen("757b94", " it's not effective.\n\n")
                }
                Money -= 10
            } else {
                ExtraText = "You don't have enough money to purchase this item\n\n"
            }
        } else if (item == "EnergyDrink") {
            if (Money >= 15) {
                ChangeStat("Health", -20)
                if (Cooldowns['EnergyDrink'] <= TotalTime) {
                    Cooldowns['EnergyDrink'] = TotalTime + 2400
                    ChangeStat("Fatigue", -30)
                    ExtraText = "You bought an energy drink for " + ColorGen("006400", "$10") + "\n" + ColorGen("2eba04", " -30 Fatigue\n") + ColorGen("d90202", "-20 Health\n\n")
                } else {
                    ExtraText = "You bought an energy drink for " + ColorGen("006400", "$10") + ColorGen("757b94", " it's not effective.\n") + ColorGen("d90202", "-20 Health\n\n")
                }
                Money -= 15
            } else {
                ExtraText = "You don't have enough money to purchase this item\n\n"
            }
        }
    }

    ForestGather(depth) {
        if (depth == 1) {
            let rng = GetRng()
            let amount = RandomNumber(7) + 3
            ChangeStat("Fatigue", 10)
            ChangeXp("Foraging", 5)
            if (rng < 300) {
                ChangeInventory("RedBerry", amount)
                ExtraText = "You found " + amount + " red berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            } else if (rng < 500) {
                ChangeInventory("BlueBerry", amount)
                ExtraText = "You found " + amount + " blue berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            } else if (rng < 600) {
                ChangeInventory("GreenBerry", amount)
                ExtraText = "You found " + amount + " green berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            } else {
                ExtraText = "You found nothing\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            }
        } else if (depth == 2) {
            let rng = GetRng()
            let amount = RandomNumber(7) + 5
            ChangeStat("Fatigue", 10)
            ChangeXp("Foraging", 7)
            if (rng < 200) {
                ChangeInventory("RedBerry", amount)
                ExtraText = "You found " + amount + " red berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+7 Foraging XP") + "\n\n"
            } else if (rng < 500) {
                ChangeInventory("BlueBerry", amount)
                ExtraText = "You found " + amount + " blue berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+7 Foraging XP") + "\n\n"
            } else if (rng < 650) {
                ChangeInventory("GreenBerry", amount)
                ExtraText = "You found " + amount + " green berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+7 Foraging XP") + "\n\n"
            } else if (rng < 700 && Time < 300) {
                ChangeInventory("Moonberry", 1)
                ExtraText = "You found 1 moonberry\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+7 Foraging XP") + "\n\n"
            } else {
                ExtraText = "You found nothing\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            }
        } else if (depth == 3) {
            let rng = GetRng()
            let amount = RandomNumber(7) + 8
            ChangeStat("Fatigue", 10)
            ChangeXp("Foraging", 10)
            if (rng < 100) {
                ChangeInventory("PurpleBerry", amount)
                ExtraText = "You found " + amount + " purple berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Foraging XP") + "\n\n"
            } else if (rng < 400) {
                ChangeInventory("BlueBerry", amount)
                ExtraText = "You found " + amount + " blue berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Foraging XP") + "\n\n"
            } else if (rng < 650) {
                ChangeInventory("GreenBerry", amount)
                ExtraText = "You found " + amount + " green berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Foraging XP") + "\n\n"
            } else if (rng < 750) {
                if (Secrets['Ruins'] == true) {
                    ExtraText = "You found some ancient ruins."
                } else {
                    ExtraText = "You found some ancient ruins. " + ColorGen("ffd700", "You can access the ruins now")
                }
                Secrets['Ruins'] = true
                //WIP
            } else if (rng < 800 && Time < 300) {
                ChangeInventory("Moonberry", 1)
                ExtraText = "You found 1 moonberry\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+7 Foraging XP") + "\n\n"
            } else {
                ExtraText = "You found nothing\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
            }
        }
    }
    
    Sleep(hours) {
        ChangeStat("Fatigue", -10 * hours)
    }
    
    FastFoodRestaurantWork() {
        let amount = RandomNumber(5)
        Money += 5 + amount
        ChangeStat("Fatigue", 9)
        ChangeXp("Communication", 3)
        ExtraText = "Nothing interesting happened.\nYou got paid " + ColorGen("006400", "$5") + " and you earnt " + ColorGen("006400", "$" + amount) + " in tips\n" + ColorGen("d90202", "+9 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
    }
    
    ClassManager(args) {
        let Subject = args[0]
        let Type = args[1]
        if (Subject == "Science") {
            if (Type == "Study") {
                ChangeXp("Science", 10)
                ChangeStat("Fatigue", 10)
                Time = 585
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Science XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("Science", 2)
                ChangeStat("Fatigue", 3)
                Time = 585
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 Science XP") + "\n\n"
            }
        } else if (Subject == "English") {
            if (Type == "Study") {
                ChangeXp("English", 10)
                ChangeStat("Fatigue", 10)
                Time = 635
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 English XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("English", 2)
                ChangeStat("Fatigue", 3)
                Time = 635
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 English XP") + "\n\n"
            }
        } else if (Subject == "Math") {
            if (Type == "Study") {
                ChangeXp("Math", 10)
                ChangeStat("Fatigue", 10)
                Time = 715
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Math XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("Math", 2)
                ChangeStat("Fatigue", 3)
                Time = 715
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 Math XP") + "\n\n"
            }
        } else if (Subject == "Business") {
            if (Type == "Study") {
                ChangeXp("Business", 10)
                ChangeStat("Fatigue", 10)
                Time = 765
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Business XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("Business", 2)
                ChangeStat("Fatigue", 3)
                Time = 765
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 Business XP") + "\n\n"
            }
        } else if (Subject == "History") {
            if (Type == "Study") {
                ChangeXp("History", 10)
                ChangeStat("Fatigue", 10)
                Time = 845
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 History XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("History", 2)
                ChangeStat("Fatigue", 3)
                Time = 845
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 History XP") + "\n\n"
            }
        } else if (Subject == "PE") {
            if (Type == "Study") {
                ChangeXp("Fitness", 10)
                ChangeStat("Fatigue", 20)
                Time = 895
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+20 Fatigue") + ColorGen("21a8d1", "\n+10 Fitness XP") + "\n\n"
            } else if (Type == "Daydream") {
                ChangeXp("Fitness", 2)
                ChangeStat("Fatigue", 3)
                Time = 895
                ExtraText = "You ignored all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+3 Fatigue") + ColorGen("21a8d1", "\n+2 Fitness XP") + "\n\n"
            }
        } else if (Subject == "Technology") {
            if (Type == "Study") {
                ChangeXp("Technology", 10)
                ChangeStat("Fatigue", 5)
                Time = 945
                ExtraText = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+5 Fatigue") + ColorGen("21a8d1", "\n+10 Technology XP") + "\n\n"
            }
        }
        let m = Time % 60
        let h = (Time-m)/60
        document.getElementById("Clock").textContent = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString()
    }
    
    DebtPay() {
        Money -= DebtDue
        Debt -= DebtDue
        DebtDue = 0
        ExtraText = "You paid the banker with physical cash.\n\n"
    }
    
    OfficeWorkManager(hour) {
        let rng = GetRng()
        if (hour < 8) {
            if (rng < 100) {
                ChangeStat("Fatigue", 12)
                ExtraText = "It is currently the " + NumberSuffix(hour) + " hour of your day shift\n" + ColorGen("d90202", "+12 Fatigue") + "\n\nYou had to deliver documents to your manager.\n\n{Next|OfficeWorkMid|60|OfficeWorkManager(" + (Number(hour) + 1) + ")}"
            } else if (rng < 150) {
                ChangeStat("Fatigue", 3)
                ExtraText = "It is currently the " + NumberSuffix(hour) + " hour of your day shift\n" + ColorGen("d90202", "+3 Fatigue") + "\n\nYou got a short break during your shift.\n\n{Next|OfficeWorkMid|60|OfficeWorkManager(" + (Number(hour) + 1) + ")}"
            } else if (rng < 250) {
                ChangeStat("Fatigue", 10)
                ExtraText = "It is currently the " + NumberSuffix(hour) + " hour of your day shift\n" + ColorGen("d90202", "+10 Fatigue") + "\n\nYou had to attend an extremely boring meeting for the entire hour.\n\n{Next|OfficeWorkMid|60|OfficeWorkManager(" + (Number(hour) + 1) + ")}"
            } else {
                ChangeStat("Fatigue", 9)
                ExtraText = "It is currently the " + NumberSuffix(hour) + " hour of your day shift\n" + ColorGen("d90202", "+9 Fatigue") + "\n\nNothing interesting happened.\n\n{Next|OfficeWorkMid|60|OfficeWorkManager(" + (Number(hour) + 1) + ")}"
            }

        } else if (hour == 8) {
            ChangeStat("Fatigue", 9)
            ExtraText = "It is the last hour of your day shift. You can leave after this.\n" + ColorGen("d90202", "+9 Fatigue") + "\n\nNothing interesting happened.\n\n{Next|OfficeWorkEnd|60}"
        }
    }

    CrystalCavesManager(args) {
        let X = Number(args[0])
        let Y = Number(args[1])
        let Maze = MazeGen(X, Y, 3, 3, CrystalCavesLocations)
        console.log(args)
        EndText = "You are in a cave filled with glowing white crystals.\n\n"
        if (Maze[0] != false) {
            EndText += Maze[0] + "\n\n"
        }
        if (Maze[1] == true) {
            EndText += "{Walk north (10m)|CrystalCaves|10|CrystalCavesManager(" + X + "," + (Y - 1) + ")}\n"
        }
        if (Maze[2] == true) {
            EndText += "{Walk south (10m)|CrystalCaves|10|CrystalCavesManager(" + X + "," + (Y + 1) + ")}\n"
        }
        if (Maze[3] == true) {
            EndText += "{Walk east (10m)|CrystalCaves|10|CrystalCavesManager(" + (X + 1) + "," + Y + ")}\n"
        }
        if (Maze[4] == true) {
            EndText += "{Walk west (10m)|CrystalCaves|10|CrystalCavesManager(" + (X - 1) + "," + Y + ")}\n"
        }
    }
    
    CrystalCavesStoreBuy(item) {
        if (item == "Moonberry") {
            if (Money >= 50) {
                ExtraText = "You bought a Moonberry.\n\n"
                ChangeInventory("Moonberry", 1)
                Money -= 50
            } else {
                ExtraText = "You don't have enough money to purchase this item\n\n"
            }
        }
    }

    StallLoader(stall) {
        if (stall == "MarketStreetFruitBuyer") {
            if (Inventory['RedBerry'] >= 1) {
                EndText += "{Sell Red Berries|StallSell|0|StallSellManager(RedBerry,MarketStreetFruitBuyer)}\n"
            }
            if (Inventory['BlueBerry'] >= 1) {
                EndText += "{Sell Blue Berries|StallSell|0|StallSellManager(BlueBerry,MarketStreetFruitBuyer)}\n"
            }
            if (Inventory['GreenBerry'] >= 1) {
                EndText += "{Sell Green Berries|StallSell|0|StallSellManager(GreenBerry,MarketStreetFruitBuyer)}\n"
            }
            EndText += "\n{Leave|MarketStreet|0}"
        }
    }

    StallSellManager(args) {
        let item = args[0]
        let PrevStall = args[1]
        ExtraText += "Selling " + ItemData[item]['Name'] + ". You have " + Inventory[item] + "\nPrice Per Item: " + ColorGen("006400", "$" + StallSellPrices[item]) + "\n\n{Sell One|StallSell|0|SellItem(" + item + ",1," + PrevStall + ")}\n{Sell Half|StallSell|0|SellItem(" + item + "," + Math.round(Inventory[item] / 2) + "," + PrevStall + ")}\n{Sell All|StallSell|0|SellItem(" + item + "," + Inventory[item] + "," + PrevStall + ")}"
    }

    SellItem(args) {
        let item = args[0]
        let quantity = args[1]
        let PrevStall = args[2]
        Inventory[item] -= quantity
        Money += StallSellPrices[item] * quantity
        ExtraText = "You sold " + quantity + " " + ItemData[item]['Name'] + " for " + ColorGen("006400", "$" + StallSellPrices[item] * quantity) + "\n\n{Next|" + PrevStall + "|0|StallLoader(" + PrevStall + ")}"
    }

    ForestRuinsManager(action) {
        if (action == "Explore") {
            ChangeStat("Fatigue", 10)
            ChangeXp("History", 10)
            ExtraText = "You explore the ruins.\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 History XP") + "\n\n" // TODO: put better description
        }
    }
    
    CombatManager(args) {
        if (args[2] == undefined) {
            SetupPresetEnemy(args[1])
        }
        let Turn = 0
        let PlayerActionText = ""
        let EnemyActionText = ""
        if (args[2] != undefined) {
            Turn += Number(args[2])
            if (args[3] == "Punch") {
                let dmg = Math.round(10 * (Skills['Fitness'] / 10 + 1))
                Enemy['Health'] -= dmg
                PlayerActionText = "\nYou punched " + Enemy['Name'] + " and dealt " + dmg + " damage"
            } else if (args[3] == "Kick") {
                let dmg = Math.round((Math.random() * 10 + 5) * (Skills['Fitness'] / 10 + 1))
                Enemy['Health'] -= dmg
                PlayerActionText = "\nYou kicked " + Enemy['Name'] + " and dealt " + dmg + " damage"
            }
            EnemyActionText = "\n" + Enemy['Name'] + " punched you and dealt 5 damage"
            ChangeStat("Health", -5)
        }
        ExtraText = BoldGen("Combat") + "\n\n" + BoldGen("You") + "\nHealth: " + Math.round(Stats['Health']) + "/100" + PlayerActionText
        let FinalArgs = args[0] + "," + args[1] + "," + Turn
        ExtraText += "\n\n\n" + BoldGen(Enemy['Name']) + "\nHealth: " + Enemy['Health'] + "/" + Enemy['MaxHealth'] + EnemyActionText + "\n\n"
        if (Enemy['Health'] <= 0) {
            EndText += "You won\n\n"
            let gain = RandomNumberFromMinMax(EnemyDrops[args[1]]['MoneyMin'], EnemyDrops[args[1]]['MoneyMax'])
            if (EnemyDrops[args[1]] != undefined) {
                EndText += "You gained " + ColorGen("006400", "$" + gain) + "\n\n{Next|" + args[0] + "|0}"
            }
            Money += gain
            return
        } else if (Stats['Health'] <= 0) {
            EndText += "You lost\n\n{Next (2h)|HospitalInRoom|120}"
            return
        }
        LoadCombatButtons(FinalArgs)
    }

    TechnologyStoreBuy(item) {
        if (item == "Laptop") {
            if (Money >= 300) {
                ExtraText = "You bought a laptop for " + ColorGen("006400", "$300") + "\nYou can use it in your home.\n\n"
                Money -= 300
                HomeUpgrades['Laptop'] = true
            } else {
                ExtraText = "You don't have enough money to purchase this item\n\n"
            }
        }
    }

    BuyWifiSub(NotSureWhatToNameThIsArgument) {
        if (NotSureWhatToNameThIsArgument == "Buy") {
            if (Money >= 10) {
                Money -= 10
                DailySubs['Wifi'] = true
                ExtraText = "You bought a wifi subscription. You need a laptop to use it.\n\n"
            } else {
                ExtraText = "You don't have enough money to buy a subscription\n\n"
            }
        } else {
            delete DailySubs['Wifi']
            ExtraText = "You cancelled your wifi subscription\n\n"
        }
    }

    NewsManager(NewsType) {
        if (NewsType == "Digital") {
            ExtraText = "There is nothing interesting on the news right now.\n\n"
        } else {
            if (Money >= 2) {
                ExtraText = "You buy a newspaper and read it.\n\n"
                EndText = "There is nothing interesting right now\n\n{Next|MeadowbrookStreet|0}"
                Money -= 2
            } else {
                ExtraText = "You do not have enough money to purchase a newspaper.\n\n{Back|MeadowbrookStreet|0}"
            }
        }
    }
}
const scene = new scenes()
const scenefunctions = new SceneFunctions()
// SETUP
var SidebarShown = true
$("#SidebarToggle").click(function(e) {
    console.log("Sidebar Toggled")
    if (SidebarShown) {
        $("#Sidebar").hide()
        $("#SidebarToggle").css("left","0px")
        $("#Main").css("left","0px")
        $("#SidebarToggle").html(">")
        SidebarShown = false
    } else {
        $("#Sidebar").show()
        $("#SidebarToggle").css("left","307px")
        $("#Main").css("left","300px")
        $("#SidebarToggle").html("<")
        SidebarShown = true
    }
})
// OTHER SETUP
function LoadText(text) {
    var Main = document.getElementById("Main")
    while (Main.firstChild) {
        Main.removeChild(Main.lastChild)
    }
    var re = new RegExp("\\{([^|{}]+)\\|([^|{}]+)\\|([0-9]+)\\|?([^|{}(]+)?\\(?([^(){}|]+)?\\)?\\}", "g")
    var re2 = new RegExp("{[^}]{1,}}", "g")
    var SplitText = text.split(re2)
    var SplitLinks = []
    do {
        m = re.exec(text)
        if (m) {
            SplitLinks.push(m)
        }
    } while (m)
    //console.log(SplitLinks)
    if (ExtraText != "" || ExtraText != undefined) {
        TextLoader(ExtraText)
        ExtraText = ""
    }
    SplitText.forEach(function (item, num) {
        //console.log(item)
        div = document.createElement("div")
        div.innerHTML = item
        div.style.color = "white"
        div.className = "MainText"
        document.getElementById("Main").appendChild(div)
        if (num <= SplitLinks.length - 1) {
            button = document.createElement("button")
            console.log(SplitLinks[num][1])
            button.innerHTML = SplitLinks[num][1]
            button.className = "MainLink"
            button.id = "Button" + num
            button.addEventListener("click", function() {
                ChangeTime(Number(SplitLinks[num][3]))
                if (SplitLinks[num][4]) {
                    if (SplitLinks[num][5]) {
                        if (SplitLinks[num][5].includes(",")) {
                            scenefunctions[SplitLinks[num][4]](SplitLinks[num][5].split(","))
                        } else {
                            scenefunctions[SplitLinks[num][4]](SplitLinks[num][5])
                        }
                    } else {
                        scenefunctions[SplitLinks[num][4]]()  
                    }
                }
                SceneManager(SplitLinks[num][2])
                document.getElementById("MainTransition").style.zIndex = 2
                document.getElementById("MainTransition").style.opacity = 0
                setTimeout(function() {
                    document.getElementById("MainTransition").style.zIndex = 0
                    document.getElementById("MainTransition").style.opacity = 1
                }, 300)
            })
            document.getElementById("Main").appendChild(button)
        }
    })
    if (EndText != "" || EndText != undefined) {
        TextLoader(EndText)
        EndText = ""
    }
}
$("#InventoryButton").click(function() {
    if (InventoryHidden == true) {
        InventoryHidden = false
        $("#Inventory").show()
    } else {
        InventoryHidden = true
        $("#Inventory").hide()
    }
})

$("#StatsButton").click(function() {
    if (StatsHidden == true) {
        StatsHidden = false
        $("#Stats").show()
    } else {
        StatsHidden = true
        $("#Stats").hide()
    }
})

$("#SavesButton").click(function() {
    if (SavesHidden == true) {
        SavesHidden = false
        $("#Saves").show()
    } else {
        SavesHidden = true
        $("#Saves").hide()
    }
})

$("#ExportSave").click(function() {
    GetSave()
})

$("#ImportSave").click(function() {
    LoadSave()
})

function SceneManager(selected) {
    let timetick = Date.now()
    var thescene = scene[selected]()
    console.log(ExtraText)
    LoadText(thescene)
    OldScene = CurrentScene
    CurrentScene = selected
    document.getElementById("Money").textContent = "$" + Money
    console.log("Loaded scene " + selected + " in " + String(Date.now() - timetick))
}
SceneManager("Menu")
//LoadText("some test string oh also click {this:tothat} and {thistoo:tothattoo} ok thx")
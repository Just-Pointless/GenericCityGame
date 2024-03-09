window.onload = function() {
    // VARIABLES
    var money = 0
    var time = 420
    var day = 1
    var TotalTime = 420
    var jobs = {}
    var extratext = ""
    var stats = {"fatigue": 0, "health": 100}
    var debt = 10000
    var debtdue = 100
    var tutorials = {}
    var skills = {"Communication": 0, "Math": 0, "Foraging": 0, "Science": 0, "English": 0, "Math": 0, "Business": 0, "History": 0, "PE": 0}
    var skillxp = {"Communication": 0, "Math": 0, "Foraging": 0, "Science": 0, "English": 0, "Math": 0, "Business": 0, "History": 0, "PE": 0}
    var cooldowns = {"Coffee": 0, "EnergyDrink": 0}
    var inventory = {}
    var itemnames = {"RedBerry": "Red Berries", "BlueBerry": "Blue Berries", "GreenBerry": "Green Berries"}
    var InventoryHidden = true
    // EXTRA FUNCTIONS
    function ChangeTime(amount) {
        if ((time + amount) > 1440) {
            time += amount - 1440
            day += 1
        } else {
            time += amount
        }
        TotalTime += amount
        ChangeStat("health", amount / 60)
        let m = time % 60
        let h = (time-m)/60
        document.getElementById("Clock").textContent = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString()
    }
    
    function GetTimeName(person) {
        if (time < 360) {
            return "night"
        } else if (time < 721) {
            return "morning"
        } else if (time < 1081) {
            return "afternoon"
        } else if (time < 1321) {
            return "evening"
        } else if (time < 1441) {
            if (person == false) {
                return "night"
            } else {
                return "evening"
            }
        } else {
            return "???"
        }
    }
    
    function ChangeStat(stat, amount) {
        if (stat == "fatigue") {
            if (stats['fatigue'] + amount >= 0) {
                stats['fatigue'] += amount
            } else {
                stats['fatigue'] = 0
            }
            document.getElementById("SidebarFatigue").textContent = "Fatigue: " + Math.round(stats['fatigue']) + "/100"
        } else if (stat == "health") {
            if (stats['health'] + amount <= 100) {
                stats['health'] += amount
            } else {
                stats['health'] = 100
            }
            document.getElementById("SidebarHealth").textContent = "Health: " + Math.round(stats['health']) + "/100"
        }
    }
    
    function ChangeXp(skill, amount) {
        if (skillxp[skill] + amount >= skills[skill] * 20 + 20) {
            skillxp[skill] += amount - (skills[skill] * 20 + 20)
            skills[skill] += 1
        } else {
            skillxp[skill] += amount
        }
    }
    
    function ColorGen(hex, text) {
        return "<span style=\"color: #" + hex + "\">" + text + "</span>"
    }
    
    function GetRng() {
        return Math.floor(Math.random() * 1000);
    }

    function RandomNumber(max) {
        return Math.ceil(Math.random() * max);
    }

    function ChangeInventory(item, increment) {
        if (inventory[item]) {
            inventory[item] += increment
            document.getElementById("INVENTORYITEM_" + item).textContent = itemnames[item] + ": " + inventory[item]
        } else {
            inventory[item] = increment
            div = document.createElement("div")
            div.textContent = itemnames[item] + ": " + inventory[item]
            div.className = "InventoryText"
            div.id = "INVENTORYITEM_" + item
            document.getElementById("InventoryItems").appendChild(div)
            
        }

        console.log(inventory)
    }
    
    function GetNextClass() {
        if (time < 585) {
            return "Science"
        } else if (time < 635) {
            return "English"
        } else if (time < 715) {
            return "Math"
        } else if (time < 765) {
            return "Business"
        } else if (time < 845) {
            return "History"
        } else if (time < 895) {
            return "Physical Education"
        } else {
            return "None"
        }
    }
    // SCENES
    class scenes {
        Test() {
            return "hi this is a test scene with 2 buttons \n{button1|Menu|0} \n{button2|invalid|0} \nok cool bye"
        }
        
        Menu() {
            return "Menu \n{Start|Tutorial|0}"
        }
        
        Tutorial() {
            return "Welcome to whatever im gonna name this game.\nThere is no predefined objective yet so you can try to earn as much money as possible.\n\nthe duration of each action is usually shown in brackets after the blue text.\ne.g. (30m) (1h 15m)\n\nThats about it press the blue text below to continue.\n{Next|Home|0}"
        }
        
        Home() {
            return "Your in your apartment its currently " + GetTimeName(false) + "\n\n{Sleep|Sleep|0}\n\n{Leave (1m)|ApartmentHall|1}"
        }
        
        ApartmentHall() {
            if (tutorials['Banker'] == true) {
                if (day >= 2) {
                    return "Your in the hall of your apartment block\n\n{Your apartment (1m)|Home|1}\n{Check mailbox (2m)|ApartmentHallMailbox|2}\n\n{Go outside (1m)|MeadowbrookStreet|1}"
                } else {
                    return "Your in the hall of your apartment block\n\n{Your apartment (1m)|Home|1}\n\n{Go outside (1m)|MeadowbrookStreet|1}"
                }
            } else {
                tutorials['Banker'] = true
                return "As you step out of your apartment a skinny man with a black bowler hat approaches you.\n\n\"Greetings, we've met before. I'm here to remind you about your outstanding balance of $10000, with a payment of $100 due this week. If you've forgotten, our bank is at " + ColorGen("ffd700", "Crestwood Street") + ", You can visit at any time to inquire about the remaining amount you owe.\"\n\n{Next|ApartmentHall|0}"
            }
        }
        
        ApartmentHallMailbox() {
            if (tutorials['School'] == true) {
                return "Your mailbox is empty.\n\n{Back|ApartmentHall|0}"
            } else {
                return "You have a letter from your school\n\n{Read (10m)|SchoolLetter1|10}\n\n{Back|ApartmentHall|0}"
            }
        }
        
        SchoolLetter1() {
            tutorials['School'] = true
            return "You open the letter and read: \"We hope this letter finds you well. This is a friendly reminder that the new academic term at Oxford School begins tomorrow.\n\nDirections from your home on Meadowbrook Street to our campus are listed below.\nMeadowbrook Street -> Lunar Road -> Oxford Street\n\nPlease do not hesitate to contact us if you have any questions or need further assistance.\"\n\n{Next|ApartmentHall|0}"
        }
        
        MeadowbrookStreet() {
            return "Your on Meadowbrook Street, a slightly poorer part of town\n\n{Apartment block (1m)|ApartmentHall|1}\n{Convenience Store (1m)|ConvenienceStore|1}\n\n{Crestwood Street (5m)|CrestwoodStreet|5}\n{Lunar Road (5m)|LunarRoad|5}"
        }
        
        ConvenienceStore() {
            if (jobs['ConvenienceStore'] == true) {
                if (stats['fatigue'] < 90) {
                    return "Your in the convenience store, it has shelves stocked with cheap items\n\n{Work (1h)|ConvenienceStore|60|ConvenienceStoreWork}\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
                } else {
                    return "Your in the convenience store, it has shelves stocked with cheap items\n\n" + ColorGen("d90202", "Your too tired to work") + "\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
                }
            } else {
                return "Your in the convenience store, it has shelves stocked with cheap items\n\n{Inquire about work (5m)|ConvenienceStoreWO1|5}\n\n{Coffee $10|ConvenienceStore|1|ConvenienceStoreBuy(Coffee)}\n{Energy Drink $15|ConvenienceStore|1|ConvenienceStoreBuy(EnergyDrink)}\n\n{Leave (1m)|MeadowbrookStreet|1}"
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
            return "Your on Crestwood street, a more wealthy part of town with tall offices and banks\n\n{Bank (1m)|Bank|1}\n{Office (1m)|Office|1}\n{Fast Food Restaurant (2m)|FastFoodRestaurant|2}\n\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}"
        }
        
        Bank() {
            return "Your in the bank. It's well lit with luxurious red carpets and a crystal chandelier\n\nDebt: " + ColorGen("006400", "$") + debt + "\n Due this week: " + ColorGen("006400", "$") + debtdue + "\n\n{Leave (1m)|CrestwoodStreet|1}"
        }
        
        Office() {
            return "Your in the office. It's well lit with a marble floor. Your unable to tell what company this office is owned by.\n\n{Receptionist (2m)|OfficeReceptionist|2}\n\n{Leave (1m)|CrestwoodStreet|1}"
        }
        
        OfficeReceptionist() {
            if (skills['Communication'] < 5 && skills['Math'] < 2) {
                return "\"Good " + GetTimeName(true) + ", how may I assist you today?\"\n\n" + ColorGen("ffa500", "Requires: Communication 5 and Math 3") + "\n\n{Leave|Office|0}"
            } else {
                return "\"Good " + GetTimeName(true) + ", how may I assist you today?\"\n\n{Inquire about work (1m)|PLACEHOLDER|1}\n\n{Leave|Office|0}" 
            }
        }
        
        OfficeReceptionistWO1() {
            return "PLACEHOLDER"
        }
        
        FastFoodRestaurant() {
            if (jobs['FastFood'] == true) {
                if (stats['fatigue'] < 90) {
                    return "Your in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n{Work (1h)|FastFoodRestaurant|60|FastFoodRestaurantWork}\n\n{Leave (1m)|CrestwoodStreet|1}"
                } else {
                    return "Your in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n" + ColorGen("d90202", "Your too tired to work") + "\n\n{Leave (1m)|CrestwoodStreet|1}"
                }
            }
            return "Your in the fast food restaurant. It's unclean and very crowded. You notice a sign on the cashier counter that states they are looking for employees.\n\n{Inquire about work (7m)|FastFoodRestaurantWO1|7}\n\n{Leave (1m)|CrestwoodStreet|1}"
        }
        
        FastFoodRestaurantWO1() {
            return "A man in a black suit walks out the back door and heads towards you \n\"Your looking for work right? Follow me\"\n\n{Next|FastFoodRestaurantWO2|0}"
        }
        
        FastFoodRestaurantWO2() {
            if (skills['Communication'] < 3) {
                return "After entering the room he asks you a few questions\n\n\"Are you good at communicating with customers?\"\n\n" + ColorGen("ffa500", "Requires: Communication 3") + "\n{No|FastFoodRestaurantWO3B|0}"
            } else {
                return "After entering the room he asks you a few questions\n\n\"Are you good at communicating with customers?\"\n\n{Yes|FastFoodRestaurantWO3A|0}\n{No|FastFoodRestaurantWO3B|0}"
            }
            
        }
        
        FastFoodRestaurantWO3A() {
            jobs['FastFood'] = true
            return "\"Great, you can begin working at any time, your pay starts at $5 per hour. You also get to keep any tips that you recieve\"\n\n{Continue|FastFoodRestaurant|0}"
        }
        
        FastFoodRestaurantWO3B() {
            return "\"Well thats unfortunate, but don't worry you can always come back at any time after you improved your skills\"\n\n{Continue|FastFoodRestaurant|0}"
        }
        
        LunarRoad() {
            if (time < 60) {
                return "Your on Lunar Road. There appears to be nothing besides a forest nearby. You notice a faint beam of light pointing towards a manhole cover\n\n{Walk towards the beam of light (1m)|LunarRoadManholeCover1|1}\n{Forest (10m)|ForestLayer1|10}\n\n{Oxford Road (5m)|OxfordStreet|5}\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}"
            } else {
                return "Your on Lunar Road. There appears to be nothing besides a forest nearby.\n\n{Forest (10m)|ForestLayer1|10}\n\n{Oxford Road (5m)|OxfordStreet|5}\n{Meadowbrook Street (5m)|MeadowbrookStreet|5}"
            }
        }
        
        LunarRoadManholeCover1() {
            return "You remove the manhole cover. There appears to be no ladder.\n\n{Go back|LunarRoad|0}"
        }
        
        ForestLayer1() {
            if (stats['fatigue'] < 100) {
                return "Your near the enterance of the forest. The trees stand tall but their spacing allows glimpses of sunlight to filter through.\n\n{Look for berries (20m)|ForestLayer1|20|Berry(1)}\n\n{Lunar Road (5m)|LunarRoad|5}"
            } else {
                return "Your near the enterance of the forest. The trees stand tall but their spacing allows glimpses of sunlight to filter through\n\n" + ColorGen("d90202", "Your too tired to look for berries") + "\n\n{Lunar Road (5m)|LunarRoad|5}"
            }
        }
        
        OxfordStreet() {
            return "Your on Oxford Street. There are a few students walking around\n\n{School (1m)|SchoolYard|1}\n\n{Lunar Road (5m)|LunarRoad|5}"
        }
        
        SchoolYard() {
            if (day < 2 || time < 480 || time > 960) {
                return "The school gates are locked. You could probably break in if you had the required skills\n\n{Leave (1m)|OxfordStreet|1}"
            } else {
                return "Your in the school courtyard, it serves as a hub for social interaction.\n\n{Enter the school (3m)|SchoolFloor1|3}\n\n{Leave (3m)|OxfordStreet|3}"
            }
        }
        
        SchoolFloor1() {
            let NextClass = GetNextClass()
            if (time >= 765 && time < 795) {
               return "Your inside the school. It's heavily crowded. You have " + NextClass + " next\n\n{" + ColorGen("91bdff", "Canteen (3m)") + "|SchoolCanteen|3}\n\n{Science Classroom (2m)|SchoolScienceClassroom|2}\n{English Classroom (2m)|SchoolEnglishClassroom|2}\n{Math Classroom (2m)|SchoolMathClassroom|2}\n{Business Classroom (2m)|SchoolBusinessClassroom|2}\n{History Classroom (2m)|SchoolHistoryClassroom|2}\n{Physical Education Classroom (2m)|SchoolPEClassroom|2}\n\n{School courtyard (3m)|SchoolYard|3}"
            } else {
                return "Your inside the school. It's heavily crowded. You have " + NextClass + " next\n\n{Canteen (3m)|SchoolCanteen|3}\n\n{Science Classroom (2m)|SchoolScienceClassroom|2}\n{English Classroom (2m)|SchoolEnglishClassroom|2}\n{Math Classroom (2m)|SchoolMathClassroom|2}\n{Business Classroom (2m)|SchoolBusinessClassroom|2}\n{History Classroom (2m)|SchoolHistoryClassroom|2}\n{Physical Education Classroom (2m)|SchoolPEClassroom|2}\n\n{School courtyard (3m)|SchoolYard|3}"
            }
        }
        
        SchoolCanteen() {
            return "Your in the canteen.\n\n{Rest (25m)|SchoolCanteen|25}\n\n{Leave (3m)|SchoolFloor1|3}"
        }
        
        SchoolScienceClassroom() {
            if (time < 550 && time > 535) {
                return "Your in the science classroom. It has slightly damaged lab equipment and walls filled with posters illustrating scientific concepts\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Science,Study)}"
            } else {
                return "The door for the science classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
        SchoolEnglishClassroom() {
            if (time < 600 && time > 585) {
                return "Your in the english classroom.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(English,Study)}"
            } else {
                return "The door for the english classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
        SchoolMathClassroom() {
            if (time < 680 && time > 665) {
                return "Your in the math classroom.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Math,Study)}"
            } else {
                return "The door for the math classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
        SchoolBusinessClassroom() {
            if (time < 730 && time > 715) {
                return "Your in the business classroom.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(Business,Study)}"
            } else {
                return "The door for the business classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
        SchoolHistoryClassroom() {
            if (time < 810 && time > 795) {
                return "Your in the history classroom.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(History,Study)}"
            } else {
                return "The door for the history classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
        SchoolPEClassroom() {
            if (time < 860 && time > 845) {
                return "Your in the physical education classroom.\n\nWhat would you like to do?\n\n{Study|SchoolFloor1|45|ClassManager(PE,Study)}"
            } else {
                return "The door for the physical education classroom is currently locked\n\n{Back|SchoolFloor1|0}"
            }
        }
        
    }
    class SceneFunctions {
        ConvenienceStoreWO() {
            jobs['ConvenienceStore'] = true
            console.log(jobs)
        }
        
        ConvenienceStoreWork() {
            let rng = GetRng()
            money += 3
            ChangeStat("fatigue", 5)
            ChangeXp("Communication", 3)
            if (rng < 100) {
                ChangeStat("fatigue", 5)
                extratext = "The convenience store suddenly had a spike in customers\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
            } else if (rng < 150) {
                ChangeStat("health", -4)
                extratext = "While stocking the shelves you slip on a puddle of water\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "-4 Health") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
            } else {
                extratext = "Nothing interesting happened.\nYou got paid " + ColorGen("006400", "$3") + "\n" + ColorGen("d90202", "+5 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
            }
        }
        
        ConvenienceStoreBuy(item) {
            console.log(item)
            if (item == "Coffee") {
                if (money >= 10) {
                    if (cooldowns['Coffee'] <= TotalTime) {
                        cooldowns['Coffee'] = TotalTime + 1200
                        ChangeStat("fatigue", -25)
                        extratext = "You bought coffee for " + ColorGen("006400", "$10") + "\n" + ColorGen("2eba04", " -25 Fatigue\n\n")
                    } else {
                        extratext = "You bought coffee for " + ColorGen("006400", "$10") + ColorGen("757b94", " it's not effective.\n\n")
                    }
                    money -= 10
                } else {
                    extratext = "You don't have enough money to purchase this item\n\n"
                }
            } else if (item == "EnergyDrink") {
                if (money >= 15) {
                    ChangeStat("health", -15)
                    if (cooldowns['EnergyDrink'] <= TotalTime) {
                        cooldowns['EnergyDrink'] = TotalTime + 1000
                        ChangeStat("fatigue", -30)
                        extratext = "You bought an energy drink for " + ColorGen("006400", "$10") + "\n" + ColorGen("2eba04", " -30 Fatigue\n") + ColorGen("d90202", "-15 Health\n\n")
                    } else {
                        extratext = "You bought an energy drink for " + ColorGen("006400", "$10") + ColorGen("757b94", " it's not effective.\n") + ColorGen("d90202", "-15 Health\n\n")
                    }
                    money -= 15
                } else {
                    extratext = "You don't have enough money to purchase this item\n\n"
                }
            }
        }

        Berry(depth) {
            if (depth == 1) {
                let rng = GetRng()
                let amount = RandomNumber(7) + 3
                ChangeStat("fatigue", 10)
                ChangeXp("Foraging", 5)
                if (rng < 300) {
                    ChangeInventory("RedBerry", amount)
                    extratext = "You found " + amount + " red berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
                } else if (rng < 500) {
                    ChangeInventory("BlueBerry", amount)
                    extratext = "You found " + amount + " blue berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
                } else if (rng < 600) {
                    ChangeInventory("GreenBerry", amount)
                    extratext = "You found " + amount + " green berries\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
                } else {
                    extratext = "You found nothing\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+5 Foraging XP") + "\n\n"
                }
            }
        }
        
        Sleep(hours) {
            ChangeStat("fatigue", -10 * hours)
        }
        
        FastFoodRestaurantWork() {
            let amount = RandomNumber(5)
            money += 5 + amount
            ChangeStat("fatigue", 7)
            ChangeXp("Communication", 3)
            extratext = "Nothing interesting happened.\nYou got paid " + ColorGen("006400", "$5") + " and you earnt " + ColorGen("006400", "$" + amount) + " in tips\n" + ColorGen("d90202", "+7 Fatigue") + ColorGen("21a8d1", "\n+3 Communication XP") + "\n\n"
        }
        
        ClassManager(args) {
            let Subject = args[0]
            let Type = args[1]
            if (Subject == "Science") {
                if (Type == "Study") {
                    ChangeXp("Science", 10)
                    ChangeStat("fatigue", 10)
                    time = 585
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Science XP") + "\n\n"
                }
            } else if (Subject == "English") {
                if (Type == "Study") {
                    ChangeXp("English", 10)
                    ChangeStat("fatigue", 10)
                    time = 635
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 English XP") + "\n\n"
                }
            } else if (Subject == "Math") {
                if (Type == "Study") {
                    ChangeXp("Math", 10)
                    ChangeStat("fatigue", 10)
                    time = 715
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Math XP") + "\n\n"
                }
            } else if (Subject == "Business") {
                if (Type == "Study") {
                    ChangeXp("Business", 10)
                    ChangeStat("fatigue", 10)
                    time = 765
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Business XP") + "\n\n"
                }
            } else if (Subject == "History") {
                if (Type == "Study") {
                    ChangeXp("History", 10)
                    ChangeStat("fatigue", 10)
                    time = 845
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+10 Fatigue") + ColorGen("21a8d1", "\n+10 Business XP") + "\n\n"
                }
            } else if (Subject == "PE") {
                if (Type == "Study") {
                    ChangeXp("Fitness", 10)
                    ChangeStat("fatigue", 20)
                    time = 895
                    extratext = "You carefully listened to all the instructions your teacher gave you. After 45 minutes the bell rang and you left the classroom\n" + ColorGen("d90202", "+20 Fatigue") + ColorGen("21a8d1", "\n+10 Business XP") + "\n\n"
                }
            }
            let m = time % 60
            let h = (time-m)/60
            document.getElementById("Clock").textContent = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString()

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
        if (extratext != "" || extratext != undefined) {
            div = document.createElement("div")
            div.innerHTML = extratext
            div.style.color = "white"
            div.className = "MainText"
            document.getElementById("Main").appendChild(div)
            extratext = ""
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
    function SceneManager(selected) {
        let timetick = Date.now()
        var thescene = scene[selected]()
        LoadText(thescene)
        document.getElementById("Money").textContent = "$" + money
        console.log("Loaded scene " + selected + " in " + String(Date.now() - timetick))
    }
    SceneManager("Test")
    //LoadText("some test string oh also click {this:tothat} and {thistoo:tothattoo} ok thx")
}
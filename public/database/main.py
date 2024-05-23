import json
import os
from threading import Thread
import time
import sys

export = {}
addFingerings=True

def write(text: str):
    sys.stdout.write(text)


def back(range_: int):
    for _ in range(range_):
        sys.stdout.write("\b")


def reverse(num: int|None):
    reversedArray = [7, 6, 5, 4, 3, 2, 1]
    if num is None:
        return 0
    return reversedArray[num]


def getLastDuplicateIndex(fingerGoal, fingeringsArray:list[str] ):
    for f in range(len(fingeringsArray) - 1, -1, -1):
        if int(fingeringsArray[f]) == fingerGoal:
            return f

defaultTuning=["E","A","D","G","B","E"]
notes=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]

def noteOffset(note:str,offset:int):
    noteIdx  = notes.index(note)
    return notes[(noteIdx+offset)%len(notes)]

def positions2tuning(positions,offset=0):
    tuning=[]
    for i in range(6):
        if positions[i] == "x":
            tuning.append("")
        else:
            tuning.append(noteOffset(defaultTuning[i],int(positions[i])+offset))
    return tuning

def parseChords():
    with open("completeChords.json", "r") as read_file:
        data = json.load(read_file)
    for key in data:

        if len(str(key)) > 1 and str(key)[1] == "b":
            continue

        export[key] = []

        for variation in data[key]:
            try:
                base = 1
                positions = list(variation["positions"])
                fingerings = list(variation["fingerings"][0])
                lowestFret = 24
                highestFret = 0

                for position in positions:

                    if position == "x":
                        continue

                    posNumber = int(position)

                    if posNumber < lowestFret:
                        lowestFret = posNumber

                    if posNumber > highestFret:
                        highestFret = posNumber

                if highestFret >= 5:
                    base = lowestFret
                    
                
                if base<=2:
                    base=1
                tuning=positions2tuning(positions)#,base-1)

                fingers = []
                barres = []


                for i in range(6):

                    if positions[i] != "x":
                        positions[i] = 1 + int(positions[i]) - base
                        if addFingerings and int(fingerings[i])>0:
                            fingers.append([reverse(i + 1), positions[i], fingerings[i]])
                        else:
                            fingers.append([reverse(i + 1), positions[i]])
                    else:
                        fingers.append([reverse(i + 1), positions[i]])

                for i in range(6):
                    finger = int(fingerings[i])

                    if finger == 0:
                        continue

                    last: int|None = getLastDuplicateIndex(finger, fingerings)
                    if len(fingerings)!=6:
                        print(variation)
                        
                    # START: Dirty fingering fix 
                    if last and last>0:
                        # new_last=last
                        while last<5:
                        # while new_last<5:
                        # for x in range(last,5):
                            if fingerings[last-1]==fingerings[last] and positions[last-1]==positions[last] and positions[last+1]==positions[last] and positions[last+1]!="x":
                                fingerings[last+1]=fingerings[last]
                                last+=1
                            else:
                                break
                    # END: Dirty fingering fix 
                    
                    if last == i:
                        continue

                    if fingerings[i] != fingerings[last] or positions[i] != positions[last]:
                        continue

                    validBarre = True
                    for barre in barres:
                        if barre["fret"] == positions[i]:
                            validBarre = False
                            break

                    if not validBarre:
                        continue

                    barres.append({
                        "fromString": reverse(i) - 1,
                        "toString": reverse(last) - 1,
                        "fret": positions[i]
                    })
                        
                fingers.reverse()
                fingersToRemove = []

                for i in range(6):
                    for barre in barres:
                        if barre["fret"] == fingers[i][1]:
                            fingersToRemove.append(fingers[i])
                            if addFingerings:
                                barre["text"]=fingers[i][2]

                for finger in fingersToRemove:
                    fingers.remove(finger)
                    

                newObject = {"title": key, "fingers": fingers, "barres": barres, "position": base, "tuning": tuning}
                export[key].append(newObject)
            except Exception as e:
                print(f'Error in {key}, {variation}\nPositions: {positions}\nFingerings: {fingerings}')
                raise e

    def writeToFile(fileName):
        if os.path.exists(fileName):
            os.remove(fileName)
        with open(fileName, "w") as outfile:
            json.dump(export, outfile)

    writeToFile("completeChordsFormatted.json")


t1 = Thread(target=parseChords, name="process")
t1.start()

write("loading...")
i = 0
chars = "/—\|"
while t1.is_alive():
    write(chars[i])
    time.sleep(.3)
    i += 1
    if i == len(chars):
        i = 0
    back(1)

back(12)
write("Done!")

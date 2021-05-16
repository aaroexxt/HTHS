# InformedTravel Multiuse Application
HTHS Hacks.2021() Project Submission

## Authors: 
Aaron Becker // Grayson Bertaina 

## Purpose:
InformedTraveler is a web application written completely in ReactJS with MaterialUI. It was designed to answer a simple need - an air travel planning system that helps users account for various forms of risk and environmental impact. We categorized the risk into four indicies - Covid Risk, Homicide Index, Corruption Index, and CO2 Index. 

On the home screen, users have two primary ways of interacting with the system. 

A, the user can fill out the fields at the bottom center of the application. The required entries are arrival airport code, departure airport code, trip type, relevant dates, and their selected cabin class. After hitting search, a list of flights will be returned (sample data for today) from the origin to the destination. On the quick summary view, information like price, CO2 emissions, and two drop downs are present. The first, "Detailed Flight Information," breaks the flight down into legs. The detailed pane includes flight number, departure time, aircraft type, time enroute, distance, and departure date. Under the second dropdown, information related to risk is available. The Covid, Homicide, and Corruption scores are calculated on a 100 point scale from recent data. 

B, the user can click on the search bar at the top right and enter a query. The closest match area and airport will be displayed with a map pinpoint and the same four risk/consideration statistics. This tool can be used to research any city or area in the world without the requirement of a trip or flight. The system will return the three key risk factors: COVID status, homicide index, and corruption index.

We believe that users will be able to make more knowledgable, risk-concious decisions utilizing our platform for travel. We plan to continue developing to launch with live data on the web. 

Thank you for your consideration, and have a great day!

```
Input Types for A:
  Departure/Arrival Airports: ICAO Code, IATA Code ie "KDAB" or "MCO"
  Trip Selector: Round Trip or One Way, which influences Departure and Return Date fields
  Departure/Return Date: Calendar selected date in mm/dd/yyyy format
  Cabin Class: dropdown selection
  Passgners: Integer
  
Input Types for B: 
Search field: ICAO Code, IATA Code, Airport Name Query, City/Area Query
```

## Roadmap
1. Switch to Live Data
2. Improve Search Recognition
3. Autofill for Queries and Fields
4. Mobile Support
5. Swift Application



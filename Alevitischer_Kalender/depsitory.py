# depository.py or just at the top of your script
HOLIDAYS_DB = {
    "gregorian": [
        {
            "name": "Gedenktag an das Massaker in Sivas",
            "month": 7,  # July
            "day": 2,
            "duration_days": 1,
            "description": "Gedenken an die Opfer von Sivas 1993."
        },
        {
            "name": "Feier zum Gedenken an Hacı Bektaş Veli",
            "month": 8,  # August
            "day": 16,
            "duration_days": 3, # Spans 16th, 17th, and 18th
            "description": "Gedenkfeier für Hacı Bektaş Veli."
        }
    ],
    "islamic": [
        {
            "name": "Beginn des Muharrem-Fasten",
            "month": 1,  # Muharrem is the 1st month in the Hijri calendar
            "day": 1,
            "duration_days": 12,
            "description": "12-tägiges Trauerfasten."
        }
    ]
}
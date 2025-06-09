#!/usr/bin/env python3.11

from time import time
from pymongo import MongoClient
import urllib.parse
from bson.objectid import ObjectId
import pymongo

username = urllib.parse.quote_plus('kamya-samuel')
password = urllib.parse.quote_plus('l1ght0ut')
client = MongoClient(f"mongodb://{username}:{password}@localhost:27017/")
samala_db = client.samala_db

usersCollection = samala_db.usersCollection
adminsCollection = samala_db.adminsCollection #{'adminUsername':"", 'hashed_password':b''}
paymentsCollection = samala_db.payments
ordersCollection = samala_db.orders
messagesCollection = samala_db.messages
archivesCollection = samala_db.archives
attorneyOnboarding = samala_db.attorneyOnboarding
servicesCollection = samala_db.services
tempFormCollection = samala_db.tempFormCollection
registrationsCollection = samala_db.registrationsCollection #{'registration':'', 'details':{}}
formRequestCollection = samala_db.formRequestCollection
subscriptionsCollection = samala_db.subscriptions
completedForms = samala_db.completedForms #{'username':username, completed_forms:[{'name':name, 'download_name': ''}]}
annualAccess = samala_db.annualAccess #{"username":username,"granted":False,}
signaturesCollection = samala_db.signaturesCollection #{"username":username, "name":name, "img_path":img_path}
paypalTransactions = samala_db.paypalTransactions
userActivityCollection = samala_db.userActivity
cloudStorageCollection = samala_db.cloudStorageCollection
publishedArticlesCollection = samala_db.publishedArticlesCollection
findALawyerCollection = samala_db.findALawyerCollection
articleImagesCollection = samala_db.articleIMagesCollection
legalDocsCollection = samala_db.legalDocsCollection
### Structure
# {"article_components":{
#      "cover-image": url,
#      "title": str
#      "body": str
#    },
# "excerpt": str,
# "published": boolean,
# "author": "LegalAi.Africa"
# "date-published": date
#}
coverImagesCollection = samala_db.coverImagesCollection
analysisCollection = samala_db.analysisCollection # {"username":"", "docs":[{"file_path":"","file_name":""}]}
googleOAuthCollection = samala_db.googleOAuthCollection
facebookOAuthCollection = samala_db.facebookOAuthCollection
XOAuthCollection = samala_db.XOAuthCollection
libraryDocsCollection = samala_db.libraryDocsCollection #{'doc_name':"", 'doc_uuid':'', 'doc_url':f'/static/uploads/lib_docs/{doc_uuid}'}
### Structure
# {
#   "img-name": str
# }
#usersCollection.update_many({'username': 'KamyaSamuel'}, {'$set': {'hashed_password': b'$2b$12$vQRVxco25y.yfc4CI0WYCODbtUz/4a4GqWkcMMpiP1lmosHpITA8i'}})
#print(usersCollection.find_one({'username': 'KamyaSamuel'})['purchases']['life_time_purchases'])
#usersCollection.insert_one({'firstname': 'kamya', 'surname': 'samuel', 'email': 'kess7007@gmail.com', 'tel': '0773275927', 'username': 'KamyaSamuel', 'new_orders': {}, 'old_orders': {}})
#formRequestCollection.delete_one({'_id':ObjectId('658c624750982f73a0493307')})
#for _ in cloudStorageCollection.find(): print(_)

#annualAccess.update_one({'username':'KamyaSamuel'},{'$set':{'granted':True}})
#col = completedForms.find_one({'username':'KamyaSamuel'})
#print(col['completed_forms'])
#del col['orders']
#print(col)

#adminsCollection.insert_one({"adminUsername":'admin', 'hashed_password': b'$2b$12$5QOgKlL66ZD0EPcVqTMJMenemIY69YNsdClyKyErYjOgKJ/LrAwpa'})
#print(annualAccess.find_one()['granted'])
if __name__ == "__main__":
    #for _ in libraryDocsCollection.find({}):  print(_)#['article']['cover-image-url'])
    #messagesCollection.delete_many({'name': None})
    #print(coverImagesCollection.find_one())
    #analysisCollection.update_one({'username': 'KamyaSamuel'}, {"$set":{'docs': [{'file_name': 'SOIL ANALYSIS REPORT', 'filepath': '2dc97b09-9e73-4108-be52-4c0fc60b4ac0.pdf'}, {'file_name': 'SOIL ANALYSIS REPORT', 'filepath': 'ffe37660-2410-4669-95bb-7f4af83b225b.pdf'}]}})
    for _ in libraryDocsCollection.find(): print(_)
    #registrationsCollection.delete_one('')
    #libraryDocsCollection.find_one_and_delete()
    #print(analysisCollection.find_one({})['docs'])
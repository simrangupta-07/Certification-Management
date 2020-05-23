public with sharing class ReturnCertification {
    public ReturnCertification() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Certification__c> getCertificationList() {
        return [ SELECT Certification_Id__c, Name, Cost__c, Comments__c FROM Certification__c ORDER BY Id LIMIT 10];
    }
}

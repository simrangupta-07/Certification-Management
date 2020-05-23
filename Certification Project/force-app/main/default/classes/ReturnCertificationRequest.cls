public with sharing class ReturnCertificationRequest {
    public ReturnCertificationRequest() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Certification_Request__c> getRequestsList() {
        return [ SELECT Name, Certification__r.Name, Employee__r.Name, Voucher__r.Name, Due_Date__c, Status__c, Comments__c FROM Certification_Request__c ORDER BY Id LIMIT 10];
    }
}

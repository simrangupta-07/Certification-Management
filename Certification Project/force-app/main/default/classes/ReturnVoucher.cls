public with sharing class ReturnVoucher {
    public ReturnVoucher() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Voucher__c> getVoucherList() {
        return [ SELECT Voucher_Id__c, Name, Voucher_Cost__c, Certification__r.Name, Validity__c, Active__c, Comments__c FROM Voucher__c ORDER BY Id LIMIT 10];
    }
}

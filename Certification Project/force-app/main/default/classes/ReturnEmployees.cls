public with sharing class ReturnEmployees {
    public ReturnEmployees() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployeeList() {
        return [ SELECT Emp_Id__c, Name, Email__c, Primary_Skill__c, Secondary_Skill__c, Experience__c,Company_Name__c, Comments__c FROM Employee__c ORDER BY Id LIMIT 10];
    }
}

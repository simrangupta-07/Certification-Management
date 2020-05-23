import { LightningElement, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import getEmployeeList from '@salesforce/apex/ReturnEmployees.getEmployeeList';

import Employee_Object from '@salesforce/schema/Employee__c';
import ID_FIELD from '@salesforce/schema/Employee__c.Id';
import IdField from '@salesforce/schema/Employee__c.Emp_Id__c';
import Employeename from '@salesforce/schema/Employee__c.Name';
import EmployeeEmail from '@salesforce/schema/Employee__c.Email__c';
import EmployeeCompany from '@salesforce/schema/Employee__c.Company_Name__c';
import PrimarySkill from '@salesforce/schema/Employee__c.Primary_Skill__c';
import SecondarySkill from '@salesforce/schema/Employee__c.Secondary_Skill__c';
import EmployeeExperience from '@salesforce/schema/Employee__c.Experience__c';
import EmployeeComments from '@salesforce/schema/Employee__c.Comments__c';


const COLS = [
    { label: 'Employee Id', fieldName: 'Emp_Id__c' },
    { label: 'Employee Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Email', fieldName: 'Email__c', type: 'email', editable: true },
    { label: 'Primary Skill', fieldName: 'Primary_Skill__c', type: 'text', editable: true },
    { label: 'Secondary Skill', fieldName: 'Secondary_Skill__c', type: 'text', editable: true, cellAttributes: { alignment: 'left' } },
    { label: 'Experience', fieldName: 'Experience__c', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
    { label: 'Company', fieldName: 'Company_Name__c', type: 'text', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View Details', type: 'button-icon', initialWidth: 70,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'brand',
            alternativeText: 'View'
        }
    },
    { label: 'Delete', type: 'button-icon', initialWidth: 70,
        typeAttributes: {
            label: 'remove',
            name: 'delRec',
            iconName: 'action:delete',
            title: 'Delete',
            variant: 'error',
            alternativeText: 'delete'
        }
    }
];

export default class EmployeeRecord extends LightningElement {

    empName = '';
    empEmail = '';
    empCompany = '';
    emppskill = '';
    empsskill = '';
    empExperience = 0;
    
    empComments = '';

    onModification = (event) => {
        if(event.target.label == 'Employee Name'){
            this.empName = event.target.value;
        }
        else if(event.target.label == 'Company Name'){
            this.empCompany = event.target.value;
        }
        else if(event.target.label == 'Email'){
            this.empEmail = event.target.value;
        }
        else if(event.target.label == 'Primary Skill'){
            this.emppskill = event.target.value;
        }
        else if(event.target.label == 'Secondary Skill'){
            this.empsskill = event.target.value;
        }
        else if(event.target.label == 'Experience'){
            this.empExperience = event.target.value;
        }
        else if(event.target.label == 'Comments'){
            this.empComments = event.target.value;
        }

    }

    addEmployee = (event) => {
        const fields = {};

        fields[Employeename.fieldApiName] = this.empName;
        fields[EmployeeEmail.fieldApiName] = this.empEmail;
        fields[EmployeeCompany.fieldApiName] = this.empCompany;
        fields[PrimarySkill.fieldApiName] = this.emppskill;
        fields[SecondarySkill.fieldApiName] = this.empsskill;
        fields[EmployeeExperience.fieldApiName] = this.empExperience;
        fields[EmployeeComments.fieldApiName] = this.empComments;
   
        console.log(fields);

        const recordInput = { apiName: Employee_Object.objectApiName, fields };

        createRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Record Successfully Created',
                message: 'Employee Added',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error in creating record',
                variant: 'error'
            }));
        })
    } 

    cleardetails = (event) => {
        this.template.querySelector('form').reset();
    }

    

    @track bShowModal = false;
    @track error;
    @track record = {};
    @track columns = COLS;
    @track draftValues = [];
    selected = [];

    @track recId;
    @wire(getEmployeeList)
    employee;

    manageRow(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteEmployee(row);
        }

    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }


    

    manageSave = (event) =>  {

        const recoredInputs = event.detail.draftValues.slice().map((draft) => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recoredInputs.map((recordInput) => {
            updateRecord(recordInput)
        });

        Promise.all(promises).then((emp) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Employee updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            //return refreshApex(this.employee);
            location.reload();
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: event.body.message,
                    variant: 'error'
                })
            );
        });
    }

    deleteEmployee = (currRow) => {


        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.employee);
                location.reload();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'Cannot Delete',
                        variant: 'error'
                    })
                );
            });
            

        console.log('delete');
    }

}
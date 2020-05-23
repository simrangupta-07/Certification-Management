import { LightningElement, wire, track } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord } from 'lightning/uiRecordApi';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getRequestsList from '@salesforce/apex/ReturnCertificationRequest.getRequestsList';

import Certification_Request_Object from '@salesforce/schema/Certification_Request__c';
import Employee_Object from '@salesforce/schema/Employee__c';
import Voucher_Object from '@salesforce/schema/Voucher__c';
import Certification_Object from '@salesforce/schema/Certification__c';
import CertificationReqStatus from '@salesforce/schema/Certification_Request__c.Status__c';
import CertificationReqDueDate from '@salesforce/schema/Certification_Request__c.Due_Date__c';
import CertificationReqVoucher from '@salesforce/schema/Certification_Request__c.Voucher__c';
import CertificationReqCertification from '@salesforce/schema/Certification_Request__c.Certification__c';
import CertificationReqComments from '@salesforce/schema/Certification_Request__c.Comments__c';
import CertificationReqEmployee from '@salesforce/schema/Certification_Request__c.Employee__c';

const COLS = [
    { label: 'Request Id', fieldName: 'Name' },
    { label: 'Certification', fieldName: 'Certification__c', type: 'text' },
    { label: 'Employee', fieldName: 'Employee__c', type: 'text' },
    { label: 'Voucher', fieldName: 'Voucher__c', type: 'text' },
    { label: 'Due Date', fieldName: 'Due_Date__c', type: 'date' },
    { label: 'Status', fieldName: 'Status__c', editable: true },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text' },
    {
        label: 'View', type: 'button-icon', initialWidth: 70,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'brand',
            alternativeText: 'View'
        }
    },
    {
        label: 'Delete', type: 'button-icon', initialWidth: 70,
        typeAttributes: {
            label: 'remove',
            name: 'delRec',
            iconName: 'action:delete',
            title: 'Delete',
            variant: 'destructive',
            alternativeText: 'Delete'
        }
    }
];

export default class CertificateRequestDetails extends LightningElement {

    certification_field = CertificationReqCertification;
    employee_field = CertificationReqEmployee;
    voucher_field = CertificationReqVoucher;
    dueDate_field = CertificationReqDueDate;
    comments_field = CertificationReqComments;

    createRequest = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Success',
            message: 'Request Created !',
            variant: 'success'
        }));
        location.reload();
    }

    clear = (event) => {
        this.template.querySelector('form').reset();
    }

    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    @track requests;
    selected = [];

    @track recId;
    @wire(getRequestsList)
    CertReq(result) {
        if (result.data) {
            let values = [];
            result.data.forEach(i => {
                let value = {};
                value.Id = i.Id;
                value.Name = i.Name;
                value.Certification__c = i.Certification__r.Name;
                value.Employee__c = i.Employee__r.Name;
                value.Due_Date__c = i.Due_Date__c;
                value.Status__c = i.Status__c;
                if (i.hasOwnProperty('Voucher__r')) {
                    value.Voucher__c = i.Voucher__r.Name;
                } else {
                    value.Voucher__c = "";
                }
                value.Comments__c = i.Comments__c;
                values.push(value);
            });
            console.log(result.data);
            this.requests = values;
            this.error = undefined;
        } else {
            this.requests = undefined;
            this.error = result.error;
        }
    }

    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if (event.detail.action.label === 'Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label === 'remove') {
            console.log('clicked Delete button');
            this.deleteRequests(row);
        }

    }

    openModal() {
        this.bShowModal = true;
    }

    closeModal() {
        this.bShowModal = false;
    }


    handleSave = (event) => {

        const recoredInputs = event.detail.draftValues.slice().map((draft) => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recoredInputs.map((recordInput) => {
            updateRecord(recordInput)
        });

        Promise.all(promises).then((req) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Request updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            //return refreshApex(this.requests);
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

    deleteRequests = (currRow) => {

        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );

                return refreshApex(this.requests);
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
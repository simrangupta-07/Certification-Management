import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { deleteRecord } from 'lightning/uiRecordApi';
import getCertificationList from '@salesforce/apex/ReturnCertification.getCertificationList';

import Certification_Object from '@salesforce/schema/Certification__c';
import CertificateName from '@salesforce/schema/Certification__c.Name';
import CertificateCost from '@salesforce/schema/Certification__c.Cost__c';
import CertificateComments from '@salesforce/schema/Certification__c.Comments__c';

const COLS = [
    { label: 'Certification Id', fieldName: 'Certification_Id__c' },
    { label: 'Certification Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Cost', fieldName: 'Cost__c', type: 'number', editable: true, cellAttributes: { alignment: 'left' } },
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View', type: 'button-icon', initialWidth: 70,
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
            variant: 'destructive',
            alternativeText: 'Delete'
        }
    }
];

export default class CertificationRecord extends LightningElement {

    certName = '';
    certComments = '';
    certCost = 0;

    handleChanges = (event) => {
        if(event.target.label == 'Certificate Name'){
            this.certName = event.target.value;
        }
        else if(event.target.label == "Comments"){
            this.certComments = event.target.value;
        }
        else if(event.target.label == "Certificate Cost"){
            console.log(event.target.value);
            this.certCost = event.target.value;
        }
    }

    createCertification = (event) => {
        const fields = {};
        fields[CertificateName.fieldApiName] = this.certName;
        fields[CertificateCost.fieldApiName] = this.certCost;
        fields[CertificateComments.fieldApiName] = this.certComments;

        console.log(fields);

        const recordInput = { apiName: Certification_Object.objectApiName, fields };

        createRecord(recordInput).then(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Successfully Created',
                message: 'Certification Added',
                variant: 'success'
            }));
            location.reload();
        }).catch(() => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Error in creating record',
                variant: 'error'
            }))
        })
    }

    clear = (event) => {
        this.template.querySelector('form').reset();
    }


    @track bShowModal = false;
    @track record = {};
    @track error;
    @track columns = COLS;
    @track draftValues = [];
    selected = [];

    @track recId;
    @wire(getCertificationList)
    certification;


    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteCertification(row);
        }

    }

    openModal() {  
        this.bShowModal = true;
    }
 
    closeModal() {    
        this.bShowModal = false;
    }

    handleSave = (event) =>  {

        const recoredInputs = event.detail.draftValues.slice().map((draft) => {
            const fields = Object.assign({}, draft);
            return { fields };
        });

        const promises = recoredInputs.map((recordInput) => {
            updateRecord(recordInput)
        });

        Promise.all(promises).then((cert) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Certification updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            //return refreshApex(this.certification);
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

    deleteCertification = (currRow) => {

        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.certification);
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
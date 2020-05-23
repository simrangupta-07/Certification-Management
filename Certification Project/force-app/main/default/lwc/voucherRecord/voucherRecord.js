import { LightningElement, wire, track } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import getVoucherList from '@salesforce/apex/ReturnVoucher.getVoucherList';

import Voucher_Object from '@salesforce/schema/Voucher__c';
import VoucherName from '@salesforce/schema/Voucher__c.Name';
import VoucherCost from '@salesforce/schema/Voucher__c.Voucher_Cost__c';
import VoucherValidity from '@salesforce/schema/Voucher__c.Validity__c';
import VoucherActive from '@salesforce/schema/Voucher__c.Active__c';
import VouherCertification from '@salesforce/schema/Voucher__c.Certification__c';
import VoucherComments from '@salesforce/schema/Voucher__c.Comments__c';
import Certification_Object from '@salesforce/schema/Certification__c';
import CertificateName from '@salesforce/schema/Certification__c.Name';
import CertificateCost from '@salesforce/schema/Certification__c.Cost__c';

const COLS = [
    { label: 'Voucher Id', fieldName: 'Voucher_Id__c' },
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Cost', fieldName: 'Voucher_Cost__c', type: 'number', cellAttributes: { alignment: 'left' } },
    { label: 'Certification', fieldName: 'Certification__c', type: 'text'},
    { label: 'Validity', fieldName: 'Validity__c', type: 'date'},
    { label: 'Active', fieldName: 'Active__c', type: 'boolean', editable: true},
    { label: 'Comments', fieldName: 'Comments__c', type: 'text', editable: true },
    { label: 'View', type: 'button-icon', initialWidth: 75,
        typeAttributes: {
            label: 'Show',
            name: 'showRec',
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'brand',
            alternativeText: 'View'
        }
    },
    { label: 'Delete', type: 'button-icon', initialWidth: 75,
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


export default class VoucherRecord extends LightningElement {
    name_field = VoucherName;
    cost_field = VoucherCost;
    validity_field = VoucherValidity;
    active_field = VoucherActive;
    certification_field = VouherCertification;
    comments_field = VoucherComments;

    createVoucher = (event) => {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Record successfully created',
            message: 'Voucher Created !',
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
    selected = [];
    @track vouchers;

    @track recId;
    @wire(getVoucherList)
    voucher(result) {
        if (result.data) {
            let values = [];
            result.data.forEach(request => {
                let value = {};
                value.Id = request.Voucher_Id__c;
                value.Name = request.Name;
                value.Voucher_Name__c = request.Name;
                value.Voucher_Cost__c = request.Voucher_Cost__c;
                value.Validity__c = request.Validity__c;
                value.Active__c = request.Active__c;
                value.Certification__c = request.Certification__r.Name;
                value.Comments__c = request.Comments__c;
                values.push(value);
            });
            this.vouchers = values;
            this.error = undefined;
        } else {
            this.vouchers = undefined;
            this.error = result.error;
        }
    }

    handleRowAction(event) {

        const row = event.detail.row;

        console.log(JSON.stringify(event.detail.action));
        if(event.detail.action.label==='Show') {
            console.log('clicked View button');
            this.record = row;
            this.openModal();
        } else if (event.detail.action.label==='remove') {
            console.log('clicked Delete button');
            this.deleteVouchers(row);
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

        Promise.all(promises).then((vou) => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Voucher updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            //return refreshApex(this.vouchers);
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

    deleteVouchers = (currRow) => {


        deleteRecord(currRow.Id)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record deleted',
                        variant: 'success'
                    })
                );
                
                return refreshApex(this.vouchers);
                location.reload();
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: 'kkkkk',
                        variant: 'error'
                    })
                );
            });
            

        console.log('delete');
    }

}
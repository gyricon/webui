import { Component } from '@angular/core';
import { Wizard } from '../../../common/entity/entity-form/models/wizard.interface';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';

import helptext from '../../../../helptext/sharing/iscsi/iscsi-wizard';
import { IscsiService, RestService, WebSocketService } from '../../../../services/';

@Component({
    selector: 'app-iscsi-wizard',
    template: '<entity-wizard [conf]="this"></entity-wizard>',
    providers: [IscsiService]
})
export class IscsiWizardComponent {

    public route_success: string[] = ['sharing', 'iscsi'];
    isLinear = true;

    protected wizardConfig: Wizard[] = [{
        label: helptext.step1_label,
        fieldConfig: [
            {
                type: 'input',
                name: 'name',
                placeholder: helptext.name_placeholder,
                tooltip: helptext.name_tooltip,
                required: true,
            },
            {
                type: 'select',
                name: 'type',
                placeholder: helptext.type_placeholder,
                tooltip: helptext.type_tooltip,
                options: [
                    {
                        label: 'Device',
                        value: 'DISK',
                    },
                    {
                        label: 'File',
                        value: 'FILE',
                    },
                ],
            },
            // file options
            {
                type: 'explorer',
                explorerType: 'file',
                initial: '/mnt',
                name: 'path',
                placeholder: helptext.file_placeholder,
                tooltip: helptext.file_tooltip,
                isHidden: false,
                disabled: false,
                required: true,
                validation: [Validators.required],
            },
            {
                type: 'input',
                name: 'filesize',
                placeholder: helptext.filesize_placeholder,
                tooltip: helptext.filesize_tooltip,
                isHidden: false,
                disabled: false,
                required: true,
                validation: [Validators.required],
            },
            // device options
            {
                type: 'select',
                name: 'disk',
                placeholder: helptext.disk_placeholder,
                tooltip: helptext.disk_tooltip,
                options: [{
                    label: 'Create New',
                    value: 'NEW'
                }],
                isHidden: false,
                disabled: false,
                required: true,
                validation: [Validators.required]
            },
            // zvol creation group
            {
                type: 'explorer',
                explorerType: 'directory',
                initial: '/mnt',
                name: 'dataset',
                placeholder: helptext.dataset_placeholder,
                tooltip: helptext.dataset_tooltip,
                required: true,
                validation: [Validators.required],
            },
            {
                type: 'input',
                name: 'volsize',
                inputType: 'number',
                placeholder: helptext.volsize_placeholder,
                tooltip: helptext.volsize_tooltip,
                validation: [Validators.required, Validators.min(0)],
                required: true,
                class: 'inline',
                width: '70%',
                value: 0,
                min: 0,
            },
            {
                type: 'select',
                name: 'volsize_unit',
                options: [{
                    label: 'KiB',
                    value: 'K',
                }, {
                    label: 'MiB',
                    value: 'M',
                }, {
                    label: 'GiB',
                    value: 'G',
                }, {
                    label: 'TiB',
                    value: 'T',
                }],
                value: 'G',
                class: 'inline',
                width: '30%',
            },
            {
                type: 'input',
                name: 'volblocksize',
                placeholder: helptext.volblocksize_placeholder,
                tooltip: helptext.volblocksize_tooltip,
                isHidden: false,
            },
            {
                type: 'input',
                name: 'compression',
                placeholder: helptext.compression_placeholder,
                tooltip: helptext.compression_tooltip,
                isHidden: false,
            },
            {
                type: 'input',
                name: 'deduplication',
                placeholder: helptext.deduplication_placeholder,
                tooltip: helptext.deduplication_tooltip,
                isHidden: false,
            },
            // use for group
            {
                type: 'select',
                name: 'usefor',
                placeholder: helptext.usefor_placehodler,
                tooltip: helptext.usefor_tooltip,
                options: [
                    {
                        label: "VMware: Extent block size 512b, TPC enabled, no Xen compat mode, SSD speed",
                        value: 'vmware',
                    }, {
                        label: "Xen: Extent block size 512b, TPC enabled, Xen compat mode enabled, SSD speed",
                        value: 'xen',
                    },
                    {
                        label: "Legacy OS: Extent block size 512b, TPC enabled, no Xen compat mode, SSD speed",
                        value: 'legacyos',
                    },
                    {
                        label: "Modern OS: Extent block size 4k, TPC enabled, no Xen compat mode, SSD speed",
                        value: 'modernos',
                    }
                ]
            },
            {
                type: 'select',
                name: 'blocksize',
                placeholder: helptext.blocksize_placeholder,
                tooltip: helptext.blocksize_tooltip,
                options: [
                    {
                        label: '512',
                        value: 512,
                    },
                    {
                        label: '1024',
                        value: 1024,
                    },
                    {
                        label: '2048',
                        value: 2048,
                    },
                    {
                        label: '4096',
                        value: 4096,
                    },
                ],
            },
            {
                type: 'checkbox',
                name: 'insecure_tpc',
                isHidden: false,
            },
            {
                type: 'checkbox',
                name: 'xen',
                isHidden: false,
            },
            {
                type: 'input',
                name: 'rpm',
                value: 'SSD',
                isHidden: false,
            },
        ]
    }]

    protected deviceFieldGroup: any[] = [
        'disk',
    ];
    protected fileFieldGroup: any[] = [
        'path',
        'filesize',
    ];
    protected zvolFieldGroup: any[] = [
        'dataset',
        'volsize',
        'volsize_unit',
        'volblocksize',
        'compression',
        'deduplication',
    ];
    protected useforFieldGroup: any[] = [
        'blocksize',
        'insecure_tpc',
        'xen',
        'rpm',
    ];

    protected defaultUseforSettings: any[] = [
        {
            key: 'vmware',
            values: {
                'blocksize': 512,
                'insecure_tpc': true,
                'xen': false,
                'rpm': 'SSD',
            }
        },
        {
            key: 'xen',
            values: {
                'blocksize': 512,
                'insecure_tpc': true,
                'xen': true,
                'rpm': 'SSD',
            }
        },
        {
            key: 'legacyos',
            values: {
                'blocksize': 512,
                'insecure_tpc': true,
                'xen': false,
                'rpm': 'SSD',
            }
        },
        {
            key: 'modernos',
            values: {
                'blocksize': 4096,
                'insecure_tpc': true,
                'xen': false,
                'rpm': 'SSD',
            }
        }
    ]
    protected entityWizard: any;

    constructor(private iscsiService: IscsiService, private ws: WebSocketService) {

    }

    afterInit(entityWizard) {
        console.log(entityWizard);
        this.entityWizard = entityWizard;

        const disk_field = _.find(this.wizardConfig[0].fieldConfig, { 'name': 'disk' });
        //get device options
        this.iscsiService.getExtentDevices().subscribe((res) => {
            for (const i in res) {
                disk_field.options.push({ label: res[i], value: i });
            }
        })

        entityWizard.formArray.controls[0].controls['type'].valueChanges.subscribe((value) => {
            this.formTypeUpdate(value);
        });

        entityWizard.formArray.controls[0].controls['disk'].valueChanges.subscribe((value) => {
            const disableZvolGroup = value == 'NEW' && this.entityWizard.formArray.controls[0].controls['type'].value == 'DISK' ? false : true;
            this.disablefieldGroup(this.zvolFieldGroup, disableZvolGroup);
        });

        entityWizard.formArray.controls[0].controls['dataset'].valueChanges.subscribe((value) => {
            if (_.startsWith(value, '/mnt/')) {
                value = value.substring(5);
                this.getDatasetValue(value);
            }
        });

        entityWizard.formArray.controls[0].controls['usefor'].valueChanges.subscribe((value) => {
            this.formUseforValueUpdate(value);
        });

        entityWizard.formArray.controls[0].controls['type'].setValue('DISK');
        entityWizard.formArray.controls[0].controls['usefor'].setValue('vmware');
    }

    disablefieldGroup(fieldGroup, disabled) {
        fieldGroup.forEach(field => {
            const control: any = _.find(this.wizardConfig[0].fieldConfig, { 'name': field });
            control['isHidden'] = disabled;
            control.disabled = disabled;
            disabled ? this.entityWizard.formArray.controls[0].controls[field].disable() : this.entityWizard.formArray.controls[0].controls[field].enable();
        });
    }

    formTypeUpdate(type) {
        const isDevice = type == 'FILE' ? false : true;

        this.disablefieldGroup(this.fileFieldGroup, isDevice);
        this.disablefieldGroup(this.deviceFieldGroup, !isDevice);
    }

    formUseforValueUpdate(selected) {
        const settings = _.find(this.defaultUseforSettings, { key: selected });
        for (const i in settings.values) {
            const controller = this.entityWizard.formArray.controls[0].controls[i];
            controller.setValue(settings.values[i]);
        }
    }

    getDatasetValue(dataset) {
        const pool = dataset.split("/")[0];
        this.ws.call('pool.dataset.query', [[["id", "=", dataset]]]).subscribe(
            (res) => {
                for (const i in this.zvolFieldGroup) {
                    const fieldName = this.zvolFieldGroup[i];
                    if (fieldName in res[0]) {
                        const controller = this.entityWizard.formArray.controls[0].controls[fieldName];
                        controller.setValue(res[0][fieldName].value);
                    }
                }
            }
        )
        this.ws.call('pool.dataset.recommended_zvol_blocksize', [pool]).subscribe(
            (res) => {
                this.entityWizard.formArray.controls[0].controls['volblocksize'].setValue(res);
            }
        )
    }
}
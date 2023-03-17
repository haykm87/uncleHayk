import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PasswordValidation } from '../../controls/controls';
import { MainService } from '../../views/main/main.service';

@Component({
    selector: 'app-change-password',
    templateUrl: 'change-password.component.html',
    styleUrls: ['change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
    private _changePasswordForm: FormGroup;
    public error: string;
    private _isCompleted: boolean = false;
    public loading: boolean = false;
    
    constructor(
        private _fb: FormBuilder,
        private _mainService: MainService,
    ) { }

    ngOnInit() {
        this._formBuilder();
    }

    private _formBuilder(): void {
        this._changePasswordForm = this._fb.group({
            oldPassword: [null, Validators.required],
            password: [null, Validators.required],
            confirmPassword: [null, Validators.required]
        },
            {
                validator: PasswordValidation.MatchPassword
            })
    }

    private _changePassword(): void {
        this.loading = true;
        this._mainService.changePassword(
            this._changePasswordForm.get('password').value,
            this._changePasswordForm.get('oldPassword').value).subscribe((data) => {
                this._isCompleted = true;
                this.loading = false;
            },
                (error) => {
                    this.loading = false;
                    this._isCompleted = false;
                    this.error = error.error.message;
                })
    }

    public onClickChange(): void {
        if (this._changePasswordForm.valid) {
            this._changePassword();
        }
    }

    get changePasswordForm(): FormGroup {
        return this._changePasswordForm;
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    ngOnDestroy() { }
}
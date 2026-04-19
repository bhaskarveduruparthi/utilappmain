import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlService } from './url.service';
import { Observable } from 'rxjs';

export interface Customer {
    id?: number;
    customer_code?: string;
    customer_name?: string;
    customer_group?: string;
    geography?: string;
    yash_billing_entity?: string;
    region?: string;
    territory?: string;
    market?: string;
    business_development_lead?: string;
    business_development_lead_id?: string;
    country?: string;
    irm_user_id?: number;
    customer_growth_partner?: string;
    customer_status?: string;
    active?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CustomerOptions {
    customer_groups: string[];
    geographies: string[];
    yash_billing_entities: string[];
    regions: string[];
    countries: string[];
    customer_statuses: string[];
}

export interface LoginLog {
    id?: number;
    employee_id?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    success?: boolean;
    message?: string | null;
    timestamp?: string;
}

@Injectable()
export class ManageCustomerService {

    private url: string;

    constructor(private http: HttpClient, private _url: UrlService) {
        this.url = `${this._url.getApiUrl()}`;
    }

    // ── READ (paginated + optional search) ──────────────────────────────────
    getCustomers(page: number, search: string = ''): Observable<any> {
        const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
        return this.http.get(`${this.url}customers/getallcustomers?page=${page}${searchParam}`);
    }

    get_customer_records(): Observable<any> {
        return this.http.get(`${this.url}customers/getallcustomersrecords`);
    }

    // ── DROPDOWN OPTIONS ─────────────────────────────────────────────────────
    getCustomerOptions(): Observable<CustomerOptions> {
        return this.http.get<CustomerOptions>(`${this.url}customers/getcustomeroptions`);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    addCustomer(customer: Customer): Observable<any> {
        return this.http.post(`${this.url}customers/addcustomer`, customer);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────
    editCustomer(id: number, customer: Customer): Observable<any> {
        return this.http.put(`${this.url}customers/editcustomer/${id}`, customer);
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    deleteCustomer(id: number): Observable<any> {
        return this.http.delete(`${this.url}customers/deletecustomer/${id}`);
    }

    // ── EXCEL EXPORT ─────────────────────────────────────────────────────────
    downloadCustomersExcel(): Observable<Blob> {
        return this.http.get(`${this.url}customers/download-customers-excel`, {
            responseType: 'blob'
        });
    }

    // ── TEMPLATE DOWNLOAD ─────────────────────────────────────────────────────
    downloadTemplate(): Observable<Blob> {
        return this.http.get(`${this.url}customers/download-customer-template`, {
            responseType: 'blob'
        });
    }

    // ── BULK UPLOAD ───────────────────────────────────────────────────────────
    uploadCustomersBulk(formData: FormData): Observable<any> {
        return this.http.post(`${this.url}customers/upload-customers-bulk`, formData);
    }

    // ── LOGS ──────────────────────────────────────────────────────────────────
    getalllogs(page: number): Observable<any> {
        return this.http.get(`${this.url}customers/getlogs?page=${page}`);
    }

    get_log_records(): Observable<any> {
        return this.http.get(`${this.url}customers/getlogrecords`);
    }
}
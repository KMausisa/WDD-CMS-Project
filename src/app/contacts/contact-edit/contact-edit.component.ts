import { Component, OnInit, ViewChild } from '@angular/core';
import { Contact } from '../contact.model';
import { ContactService } from '../contact.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'cms-contact-edit',
  standalone: false,

  templateUrl: './contact-edit.component.html',
  styleUrl: './contact-edit.component.css',
})
export class ContactEditComponent implements OnInit {
  @ViewChild('f', { static: false }) slForm: NgForm;
  originalContact: Contact;
  contact: Contact;
  groupCOntacts: Contact[] = [];
  editMode: boolean = false;
  id: string;

  constructor(
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      let id = params['id'];
      if (!id) {
        this.editMode = false;
        return;
      }
      this.originalContact = this.contactService.getContact(id);
      if (!this.originalContact) {
        return;
      }
      this.editMode = true;
      this.contact = JSON.parse(JSON.stringify(this.originalContact));

      if (this.contact.group) {
        this.groupCOntacts = this.contact.group.slice();
      }
    });
  }

  onSubmit(form: NgForm) {
    let value = form.value;
    let newContact = new Contact(
      value.id,
      value.name,
      value.email,
      value.phone,
      value.imageUrl,
      value.group
    );
    if (this.editMode == true) {
      this.contactService.updateContact(this.originalContact, newContact);
    } else {
      this.contactService.addContact(newContact);
      this.onCancel();
    }
  }

  onCancel() {
    this.slForm.reset();
    this.router.navigate(['/contacts']);
  }
}

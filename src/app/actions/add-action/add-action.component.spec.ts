import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddActionComponent } from './add-action.component';

describe('AddActionComponent', () => {
  let component: AddActionComponent;
  let fixture: ComponentFixture<AddActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddActionComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

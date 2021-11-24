import { Component } from "@angular/core";

@Component({
    selector: "ngcontent-component",
    templateUrl: "./ngcontent.template.html"
})
export class NgcontentComponent {
    isShowContent: boolean = true;

    // --------------- проецирование контента управляющего элемента

    // - компонент NgcontentComponent создает HTML-элемент с селектором 'ngcontent-component' 

    // - если элемент 'ngcontent-component' содержит внутренний контент, то этот контент может быть 
    //      размещен внутри шаблона компонента NgcontentComponent при помощи элемента ng-content:

    // - Angular заменит элемент ng-content контентом управляющего элемента:
    //      <ng-content *ngIf="isShowContent">
    //          здесь будет размещен дочерний контент
    //      </ng-content>

    // - элемент 'ngcontent-component' является управляющим по отношению к 'table-component', 
    //      элементу 'table-component' ничего не известно о контенте управляющего компонента
    //      <ngcontent-component>
    //          <table-component></table-component>
    //      </ngcontent-component>
}
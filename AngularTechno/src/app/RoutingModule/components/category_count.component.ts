import { Component, KeyValueDiffer, KeyValueDiffers } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { RestProductRepository } from "src/app/AsyncHttpModule/models/rest.repository";
import { PaginationData } from "../models/pagination_data.model";

@Component({
    selector: "category-count",
    template: `<div class="bg-primary p-a-1">Количество категорий: {{ paginationData.countCategories }}.</div>`
})
export class CategoryCountComponent {

    private differ: KeyValueDiffer<string, any> | null = null;
    count: number = 0;
    private category: string = '';
    paginationData: PaginationData;



    constructor(
        private productRepository: RestProductRepository,
        private keyValueDiffers: KeyValueDiffers,
        private activatedRoute: ActivatedRoute) {

        // --------------- дочерние маршруты

        // - если компонент выбирается дочерним маршрутом, то он будет отображаться в 
        //      router-outlet, который находится в шаблоне компонента выбранного 
        //      родительским маршрутом

        // - компоненты получают информацию через объект ActivatedRoute только
        //      о том маршруте с помощью которого был выбран компонент

        // - свойства ActivatedRoute дают возможность дочерним компонентам обращаться
        //      ко всем данным маршрутизации:
        //      - PathFromRoot      все родительские маршруты
        //      - parent            ActivatedRoute маршрут родительского компонента, в котором
        //                          был выбран текущий компонент
        //      - firstChild        ActivatedRoute первый дочерний маршрут
        //      - children          все дочерние маршруты

        // - дочерний компонент не получит уведомлений об изменениях через свой ActivatedRoute, 
        //      если изменения касаются только родительского компонента, поэтому следует 
        //      подписываться на все маршруты возвращаемые свойством pathFromRoot
        console.log('--- --- pathFromRoot:');

        // - свойство pathFromRoot объекта ActivatedRoute содержит все маршруты, использованные
        //      при сопоставлении URL, начиная с корневого
        this.activatedRoute.pathFromRoot.forEach(route => {
            console.log(`--- --- --- url = ${JSON.stringify(route.url)}`);
            route.params.subscribe(params => {
                if (params["category"] != null) {
                    this.category = params["category"];
                    this.updateCount();
                }
            });
        });

        this.paginationData = this.productRepository.getPaginationData();
        this.productRepository.refreshPagination();
    }



    ngOnInit() {
        this.differ = this.keyValueDiffers
            .find(this.paginationData) // .find(this.productRepository.getProducts()) // 
            .create();
    }

    ngDoCheck() {
        this.updateCount();
    }

    updateCount() {
        if (this.differ) {
            let change = this.differ.diff(this.productRepository.getProducts());
            if (change != null) {
                // online обновление
                this.productRepository.refreshPagination();
                // offline обновление
                //      this.count = this.productRepository.getCountCategories();
            }
        }
    }
}
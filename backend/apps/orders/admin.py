from django.contrib import admin
from .models import MedicineOrder, MedicineOrderItem


class MedicineOrderItemInline(admin.TabularInline):
    model = MedicineOrderItem
    extra = 0
    readonly_fields = ("unit_price", "subtotal")


@admin.register(MedicineOrder)
class MedicineOrderAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "pharmacy", "status", "payment_method", "total_amount", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("patient__email", "pharmacy__pharmacy_name")
    inlines = [MedicineOrderItemInline]

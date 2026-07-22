<?php

namespace App\Http\Requests\Registration;

use App\Rules\InstitutionAddress;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'institution_name' => ['required', 'string', 'min:3', 'max:255'],
            'institution_address' => ['required', 'string', 'max:2000', new InstitutionAddress],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama tim wajib diisi.',
            'name.min' => 'Nama tim minimal 3 karakter.',
            'phone.required' => 'Nomor telepon tim wajib diisi.',
            'phone.min' => 'Nomor telepon tim minimal 10 karakter.',
            'institution_name.required' => 'Nama sekolah atau perguruan tinggi wajib diisi.',
            'institution_name.min' => 'Nama sekolah atau perguruan tinggi minimal 3 karakter.',
            'institution_address.required' => 'Alamat institusi wajib diisi.',
        ];
    }
}
